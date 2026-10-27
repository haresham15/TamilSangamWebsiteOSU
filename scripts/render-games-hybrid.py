"""Original Blender source. Run with Blender --background --python this-file -- --help.

This is an art-review candidate, not an assertion of approved photographic quality.
All motion is evaluated from exported progress; no interactive simulation state.
"""
import argparse
import json
import math
import os
from pathlib import Path
import random
import sys
import time

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Vector, Quaternion

parser = argparse.ArgumentParser()
parser.add_argument("--root", default=str(Path(__file__).resolve().parents[1]))
parser.add_argument("--output", required=True)
parser.add_argument("--samples", type=int, default=16)
parser.add_argument("--preview", action="store_true")
parser.add_argument("--all", action="store_true")
parser.add_argument("--hand-only", action="store_true")
parser.add_argument("--posters", action="store_true")
parser.add_argument("--points", default="0.10,0.42,0.72,0.93")
parser.add_argument("--macro", action="store_true")
parser.add_argument("--engine", choices=["cycles", "eevee"], default="cycles")
parser.add_argument("--keep-hand", action="store_true")
args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
ROOT = Path(args.root)
ART = ROOT / "art/games-hybrid"
OUT = Path(args.output)
OUT.mkdir(parents=True, exist_ok=True)
CAL = json.loads((ART / "camera-samples.json").read_text())
random.seed(3187)
BASIS = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))


def xyz(p):
    return BASIS @ Vector(p)


def material(name, color, roughness=0.7, metal=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metal
    return mat


def scanned(name, filename, scale, normal=None):
    mat = material(name, (0.5, 0.4, 0.3))
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    coords = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeVectorMath")
    mapping.operation = "SCALE"
    mapping.inputs[3].default_value = scale
    links.new(coords.outputs["Generated"], mapping.inputs[0])
    image = nodes.new("ShaderNodeTexImage")
    image.image = bpy.data.images.load(str(ART / "source" / filename))
    image.projection = "BOX"
    links.new(mapping.outputs["Vector"], image.inputs["Vector"])
    links.new(image.outputs["Color"], nodes.get("Principled BSDF").inputs["Base Color"])
    if normal:
        tex = nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(str(ART / "source" / normal))
        tex.image.colorspace_settings.name = "Non-Color"
        tex.projection = "BOX"
        links.new(mapping.outputs["Vector"], tex.inputs["Vector"])
        bump = nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.2
        bump.inputs["Distance"].default_value = 0.045
        links.new(tex.outputs["Color"], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], nodes.get("Principled BSDF").inputs["Normal"])
    return mat


def box(name, pos, size, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=xyz(pos))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (size[0], size[2], size[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new("Rounded manufactured edges", "BEVEL")
        mod.width, mod.segments = bevel, 3
        obj.modifiers.new("Weighted shading", "WEIGHTED_NORMAL")
    return obj


def sphere(name, pos, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, location=xyz(pos))
    obj = bpy.context.object
    obj.name, obj.scale = name, (scale[0], scale[2], scale[1])
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def line(name, points, radius, mat):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions, curve.bevel_depth, curve.bevel_resolution = "3D", radius, 2
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, p in zip(spline.points, points):
        point.co = (*xyz(p), 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def build_hand():
    vertices, uvs, body, groups = [], [], [], {}
    group = ""
    for raw in (ART / "source/base.obj").read_text().splitlines():
        fields = raw.split()
        if not fields:
            continue
        if fields[0] == "v":
            vertices.append(Vector(tuple(map(float, fields[1:4]))))
        elif fields[0] == "vt":
            uvs.append(tuple(map(float, fields[1:3])))
        elif fields[0] == "g":
            group = fields[1]
        elif fields[0] == "f":
            face = [int(f.split("/")[0]) - 1 for f in fields[1:]]
            if group == "body":
                body.append(face)
            elif group.startswith("joint-r-"):
                groups.setdefault(group, set()).update(face)
    joints = {name: sum((vertices[i] for i in ids), Vector()) / len(ids) for name, ids in groups.items()}
    wrist, elbow = joints["joint-r-hand"], joints["joint-r-elbow"]
    targets = [
        [(0.125, .062, .038), (.098, .040, .046), (.082, .024, .036), (.071, .013, .018)],
        [(.112, .084, .038), (.092, .058, .052), (.082, .028, .044), (.075, .011, .022)],
        [(.130, .078, .036), (.114, .042, .054), (.104, .019, .043), (.092, .013, .025)],
        [(.148, .071, .031), (.135, .036, .046), (.126, .015, .034), (.115, .018, .020)],
        [(.162, .063, .026), (.154, .034, .038), (.145, .018, .028), (.135, .021, .015)],
    ]
    bones = [(elbow, wrist, Vector((.265, .205, .024)), Vector((.165, .105, .034)))]
    for digit in range(1, 6):
        src = [wrist] + [joints[f"joint-r-finger-{digit}-{j}"] for j in range(1, 5)]
        dst = [Vector((.165, .105, .034))] + list(map(Vector, targets[digit - 1]))
        bones.extend(zip(src[:-1], src[1:], dst[:-1], dst[1:]))
    # Crop the actual CC0 anatomical surface, preserving connected hand topology.
    faces = [face for face in body if all(vertices[i].x < -3.55 and vertices[i].y < 3.2 and vertices[i].z > .65 for i in face)]
    used = sorted({i for face in faces for i in face})
    index = {old: new for new, old in enumerate(used)}
    posed = []
    for i in used:
        point = vertices[i]
        choices = []
        for a, b, ta, tb in bones:
            axis = b - a
            t = max(0, min(1, (point - a).dot(axis) / axis.length_squared))
            nearest = a + axis * t
            distance = (point - nearest).length
            rotation = axis.rotation_difference(tb - ta)
            mapped = ta.lerp(tb, t) + rotation @ (point - nearest) * .1
            choices.append((distance, mapped))
        choices.sort(key=lambda choice: choice[0])
        near = choices[:3]
        weights = [(distance + .015) ** -6 for distance, _ in near]
        posed.append(xyz(sum((mapped * weight for (_, mapped), weight in zip(near, weights)), Vector()) / sum(weights)))
    mesh = bpy.data.meshes.new("MakeHuman cropped anatomical grip")
    mesh.from_pydata(posed, [], [[index[i] for i in face] for face in faces])
    mesh.update()
    hand = bpy.data.objects.new("HandGrip", mesh)
    bpy.context.collection.objects.link(hand)
    bpy.context.view_layer.objects.active = hand
    hand.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(island_margin=.015)
    bpy.ops.object.mode_set(mode="OBJECT")
    for poly in mesh.polygons:
        poly.use_smooth = True
    subdiv = hand.modifiers.new("Anatomical surface refinement", "SUBSURF")
    subdiv.levels = 1
    bpy.ops.object.modifier_apply(modifier=subdiv.name)
    skin = material("Original warm skin maps", (.22, .095, .049), .5)
    hand.data.materials.append(skin)
    nodes, links = skin.node_tree.nodes, skin.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    bsdf.inputs["Subsurface Weight"].default_value = .04
    bsdf.inputs["Subsurface Radius"].default_value = (1, .35, .18)
    for kind, socket, colorspace in [("basecolor", "Base Color", "sRGB"), ("roughness", "Roughness", "Non-Color")]:
        tex = nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(str(ART / "source" / f"hand-{kind}.{'jpg' if kind == 'basecolor' else 'png'}"))
        tex.image.colorspace_settings.name = colorspace
        links.new(tex.outputs["Color"], bsdf.inputs[socket])
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(str(ART / "source/hand-normal.png"))
    tex.image.colorspace_settings.name = "Non-Color"
    normal = nodes.new("ShaderNodeNormalMap")
    normal.inputs["Strength"].default_value = .4
    links.new(tex.outputs["Color"], normal.inputs["Color"])
    links.new(normal.outputs["Normal"], bsdf.inputs["Normal"])
    for obj in bpy.context.selected_objects:
        obj.select_set(obj == hand)
    glb = ROOT / "public/models/games/hand-grip.glb"
    glb.parent.mkdir(parents=True, exist_ok=True)
    if not args.keep_hand:
        bpy.ops.export_scene.gltf(filepath=str(glb), export_format="GLB", use_selection=True, export_yup=True, export_apply=True, export_texcoords=True)
    hand.hide_render = True
    hand.select_set(False)
    print(f"HAND_EXPORT vertices={len(hand.data.vertices)} triangles={sum(len(p.vertices)-2 for p in hand.data.polygons)} bytes={glb.stat().st_size}", flush=True)
    return hand


bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = "CYCLES" if args.engine=="cycles" else "BLENDER_EEVEE_NEXT"
if args.engine=="eevee":
    scene.eevee.taa_render_samples=max(16,args.samples)
    scene.eevee.volumetric_tile_size="4"
    scene.eevee.volumetric_samples=48
scene.cycles.samples, scene.cycles.use_denoising = args.samples, True
scene.cycles.max_bounces, scene.cycles.volume_bounces = 4, 0
scene.cycles.volume_step_rate = 4
scene.cycles.volume_max_steps = 64
scene.cycles.adaptive_threshold = .08
scene.render.resolution_x, scene.render.resolution_y = 1912, 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGB"
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.view_settings.exposure = -.7
scene.world.use_nodes = True
world_nodes = scene.world.node_tree.nodes
world_bg = world_nodes.get("Background")
world_bg.inputs["Strength"].default_value = .25
sky = world_nodes.new("ShaderNodeTexSky")
sky.sky_type = "NISHITA"
sky.sun_elevation, sky.sun_rotation = .68, -1.0
sky.altitude, sky.air_density, sky.dust_density = 0, .9, .8
scene.world.node_tree.links.new(sky.outputs["Color"], world_bg.inputs["Color"])
bpy.ops.object.light_add(type="SUN", location=xyz((12, 24, 14)))
sun = bpy.context.object
sun.name, sun.data.energy, sun.data.angle = "Coherent daylight", 2.5, .035
sun.rotation_euler = (-sun.location).to_track_quat("-Z", "Y").to_euler()
hand = build_hand()
if args.hand_only:
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "games-hand.blend"))
    sys.exit(0)

foreground = bpy.data.objects.new("Poster foreground only", None)
bpy.context.collection.objects.link(foreground)
hand.parent = foreground
eyewear = material("Original black acetate poster eyewear", (.006, .007, .008), .16)
poster_objects = [hand]
eyewear_source=json.loads((ART/"poster-eyewear.json").read_text())
flat=eyewear_source["positions"]
positions=[xyz(flat[i:i+3]) for i in range(0,len(flat),3)]
indices=eyewear_source["indices"] or list(range(len(positions)))
mesh=bpy.data.meshes.new("Exact existing runtime eyewear geometry")
mesh.from_pydata(positions,[],[indices[i:i+3] for i in range(0,len(indices),3)])
mesh.materials.append(eyewear)
obj=bpy.data.objects.new("Existing calibrated frame bridge and temples",mesh)
bpy.context.collection.objects.link(obj)
for poly in mesh.polygons:
    poly.use_smooth=True
poster_objects.append(obj)
for obj in poster_objects:
    obj.parent = foreground
    obj.hide_render = True

sand = scanned("Poly Haven Coast Sand 02 CC0", "coast_sand_02_diff_1k.jpg", 16, "coast_sand_02_nor_gl_1k.jpg")
plaster = scanned("Poly Haven Rough Plaster 03 CC0", "rough_plaster_03_diff_1k.jpg", 6)
dark = material("Rubber and iron", (.018, .023, .02), .9)
body = material("Weathered olive bodywork", (.058, .071, .052), .36, .55)
glass = material("Dark smoked vehicle glass", (.04, .065, .075), .15, .45)
chrome = material("Satin aluminum", (.35, .37, .36), .24, .9)
stone = material("Warm limestone", (.60, .56, .43), .8)
green = material("Palm fronds", (.055, .12, .036), .64)
bark = material("Palm bark", (.15, .10, .055), .9)
box("Compacted beach", (0, -.18, -40), (280, .35, 240), sand)
ocean = material("Distant blue sea", (.08, .27, .34), .18, .15)
box("Ocean horizon", (-140, -.06, -180), (220, .12, 160), ocean)
for x, width in [(-6.29, 6.42), (.48, 3.92), (24.52, 40.96)]:
    box("Thick weathered compound wall", (x, 1.225, -35), (width, 2.45, .75), plaster, .06)
for x in [-2.28, 3.24]:
    for side in [-1, 1]:
        for j in range(9):
            obj = box("Broken exposed masonry", (x + side * (.78 + random.uniform(-.12, .07)), .2 + j * .24, -35), (.35, .18, .8), stone, .025)
            obj.rotation_euler.z = random.uniform(-.14, .14)
    for j in range(22):
        box("Contact rubble", (x + random.uniform(-1.5, 1.5), .08, -34 + random.uniform(-1.8, 1.8)), (random.uniform(.12, .38), .15, .24), stone, .02)
box("Left retaining wall", (-24.8, .55, -35), (30.6, 1.1, .8), plaster, .05)
for x in range(-40, -8):
    line("Iron picket", [(x, 1.1, -35), (x, 3.1, -35)], .022, dark)
for y in [1.4, 2.7]:
    line("Iron rail", [(-40, y, -35), (-9, y, -35)], .035, dark)


def suv(x, z):
    box("Original unbranded SUV body", (x, .93, z), (2.18, .78, 4.3), body, .18)
    box("SUV bonnet", (x, 1.2, z + 1.22), (2.1, .23, 1.55), body, .1)
    box("SUV cabin", (x, 1.71, z - .3), (1.88, .85, 2.4), body, .16)
    box("SUV windscreen", (x, 1.77, z + .92), (1.63, .54, .035), glass, .025)
    for side in [-1, 1]:
        box("SUV side glazing", (x + side * .95, 1.76, z - .2), (.025, .52, 1.85), glass, .02)
        box("Wing mirror", (x + side * 1.15, 1.59, z + .65), (.25, .16, .28), body, .035)
        for zz in [-1.3, 1.3]:
            bpy.ops.mesh.primitive_torus_add(major_segments=24, minor_segments=12, major_radius=.34, minor_radius=.13, location=xyz((x + side * 1.03, .47, z + zz)), rotation=(0, math.pi/2, 0))
            bpy.context.object.data.materials.append(dark)
            sphere("Wheel hub", (x + side * 1.16, .47, z + zz), (.035, .24, .24), chrome)
        box("Headlamp", (x + side * .73, 1.02, z + 2.16), (.40, .2, .04), chrome, .035)
    box("SUV bumper", (x, .63, z + 2.2), (2.25, .2, .2), dark, .05)
    for bar in range(8):
        box("Radiator grille", (x - .50 + bar * .14, .95, z + 2.18), (.055, .22, .03), chrome, .01)
    for side in [-1, 1]:
        line("Roof rails", [(x + side * .7, 2.19, z - 1.2), (x + side * .7, 2.19, z + .65)], .035, dark)


for x in [-4.06, .43, 4.92]:
    suv(x, -31)


def palm(x, z, height, seed):
    rng = random.Random(seed)
    line("Curved coconut trunk", [(x, 0, z), (x-.25, height*.5, z+.1), (x+.1, height, z)], .14, bark)
    crown = Vector((x+.1, height, z))
    leaf_vertices,leaf_faces=[],[]
    for k in range(15):
        angle = k * math.tau / 15 + rng.uniform(-.12, .12)
        extent = rng.uniform(1.8, 3.0)
        stem = []
        for j in range(25):
            t = j/24
            stem.append(crown + Vector((math.cos(angle)*extent*t, math.sin(t*math.pi)*.55 - 1.4*t*t, math.sin(angle)*extent*t)))
        line("Palm central rachis", stem, .018, green)
        for j in range(1, 24):
            t=j/24
            base=stem[j]
            for side in [-1,1]:
                spread=.52*math.sin(t*math.pi)*rng.uniform(.8,1.2)
                tip=base+Vector((-math.sin(angle)*side*spread, -.20-rng.random()*.14, math.cos(angle)*side*spread))
                bend=base.lerp(tip,.55)+Vector((0,.035,0))
                tangent=Vector((math.cos(angle)*.035,0,math.sin(angle)*.035))
                start=len(leaf_vertices)
                leaf_vertices.extend([xyz(base),xyz(bend+tangent),xyz(tip),xyz(bend-tangent)])
                leaf_faces.extend([(start,start+1,start+2),(start,start+2,start+3)])
    mesh=bpy.data.meshes.new("Tapered coconut leaflets")
    mesh.from_pydata(leaf_vertices,[],leaf_faces)
    obj=bpy.data.objects.new("Irregular palm leaflets",mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(green)


for values in [(-7.3,-38,7.9,1),(9,-40,8.4,2),(15,-42,7.5,3),(18,-46,9,4),(-14,-50,6.8,5)]:
    palm(*values)
box("Fountain limestone plinth", (12.1,.4,-19.7), (1.5,.8,1.5), stone,.08)
for y,r in [(.95,.85),(1.5,.32),(2,.65),(2.4,.15)]:
    sphere("Carved garden fountain", (12.1,y,-19.7), (r,.18,r), stone)
line("Garden parasol pole", [(14,0,-20),(14,3,-20)],.055,stone)
bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=1.6,radius2=0,depth=.6,location=xyz((14,3,-20)))
bpy.context.object.data.materials.append(stone)


def volume_material(name, fire=False, dust=False):
    mat=bpy.data.materials.new(name)
    mat.use_nodes=True
    nodes,links=mat.node_tree.nodes,mat.node_tree.links
    nodes.clear()
    output=nodes.new("ShaderNodeOutputMaterial")
    vol=nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Color"].default_value=(.095,.075,.058,1) if not fire else (.32,.18,.04,1)
    vol.inputs["Anisotropy"].default_value=.2
    coords=nodes.new("ShaderNodeTexCoord")
    radial=nodes.new("ShaderNodeVectorMath")
    radial.operation="DISTANCE"
    radial.inputs[1].default_value=(.5,.5,.5)
    links.new(coords.outputs["Generated"],radial.inputs[0])
    falloff=nodes.new("ShaderNodeMapRange")
    falloff.clamp=True
    falloff.inputs["From Min"].default_value=.15
    falloff.inputs["From Max"].default_value=.49
    falloff.inputs["To Min"].default_value=1
    falloff.inputs["To Max"].default_value=0
    links.new(radial.outputs["Value"],falloff.inputs["Value"])
    noise=nodes.new("ShaderNodeTexNoise")
    noise.noise_dimensions="4D"
    noise.inputs["Scale"].default_value=4.2
    noise.inputs["Detail"].default_value=5
    links.new(coords.outputs["Generated"],noise.inputs["Vector"])
    contrast=nodes.new("ShaderNodeMapRange")
    contrast.clamp=True
    contrast.inputs["From Min"].default_value=.40
    contrast.inputs["From Max"].default_value=.65
    links.new(noise.outputs["Fac"],contrast.inputs["Value"])
    density=nodes.new("ShaderNodeMath")
    density.operation="MULTIPLY"
    density.inputs[1].default_value=(.9 if dust else 5) if not fire else 1.2
    links.new(contrast.outputs["Result"],density.inputs[0])
    shaped=nodes.new("ShaderNodeMath")
    shaped.operation="MULTIPLY"
    links.new(density.outputs[0],shaped.inputs[0])
    links.new(falloff.outputs["Result"],shaped.inputs[1])
    links.new(shaped.outputs[0],vol.inputs["Density"])
    if fire:
        emission=nodes.new("ShaderNodeMath")
        emission.operation="MULTIPLY"
        emission.inputs[1].default_value=2.5
        links.new(shaped.outputs[0],emission.inputs[0])
        links.new(emission.outputs[0],vol.inputs["Blackbody Intensity"])
        heat=nodes.new("ShaderNodeMapRange")
        heat.inputs["To Min"].default_value=1200
        heat.inputs["To Max"].default_value=2600
        links.new(noise.outputs["Fac"],heat.inputs["Value"])
        links.new(heat.outputs["Result"],vol.inputs["Temperature"])
    links.new(vol.outputs["Volume"],output.inputs["Volume"])
    return mat


smoke=volume_material("Original noise-shaped persistent smoke")
fire=volume_material("Original volumetric fire blackbody",True)
dust=volume_material("Low spatially bounded dust",dust=True)
dust.node_tree.nodes.get("Principled Volume").inputs["Color"].default_value=(.42,.31,.19,1)
blasts=[]
for index,impact in enumerate(CAL["impacts"]):
    x,onset,radius=impact["x"],impact["hit"],impact["radius"]
    rng=random.Random(900+index)
    objects=[]
    for j in range(9):
        offset=Vector((rng.uniform(-.4,.4),.7+j*.24,rng.uniform(-.3,.3)))
        objects.append((sphere("Asymmetric smoke lobe",(x,1,-31),(1,1,1),smoke),offset,rng.uniform(.28,.53),False))
    for j in range(9):
        offset=Vector((rng.uniform(-.45,.45),rng.uniform(.1,1.4),rng.uniform(-.35,.35)))
        objects.append((sphere("Turbulent fire core",(x,1,-30),(1,1,1),fire),offset,rng.uniform(.25,.48),True))
    dust_obj=sphere("Expanding ground dust",(x,.3,-31),(1,1,1),dust)
    bpy.ops.object.light_add(type="POINT",location=xyz((x,1.5,-30)))
    light=bpy.context.object
    light.data.color=(1,.22,.025)
    light.data.shadow_soft_size=2
    debris=[]
    for j in range(14):
        obj=box("Ballistic masonry fragment",(x,0,-31),(rng.uniform(.08,.22),rng.uniform(.08,.2),rng.uniform(.08,.26)),stone,.015)
        velocity=Vector((rng.uniform(-4,4),rng.uniform(4,9),rng.uniform(-3,3)))
        debris.append((obj,velocity,Vector((rng.random(),rng.random(),rng.random()))))
    bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=8,major_radius=1,minor_radius=.25,location=xyz((x,.15,-31)))
    shock=bpy.context.object
    shock.name="Expanding turbulent dust shockwave"
    shock.data.materials.append(dust)
    trail=line("Incoming missile vapor trail",[(x,4,-31),(x,8,-34)],.055,stone)
    missile=sphere("Incoming missile",(x,4,-31),(.08,.08,.35),dark)
    blasts.append((x,onset,radius,objects,dust_obj,light,debris,shock,trail,missile))

bpy.ops.object.camera_add()
camera=bpy.context.object
scene.camera=camera
camera.data.sensor_fit="VERTICAL"
camera.data.sensor_height=24
camera.data.clip_start=.01
camera.data.clip_end=600


def state_at(sample,width=1912,height=800,poster=False):
    scene.render.resolution_x,scene.render.resolution_y=width,height
    camera.location=xyz(sample["position"])
    direction=xyz(sample["lookAt"])-camera.location
    camera.rotation_euler=direction.to_track_quat("-Z","Y").to_euler()
    camera.data.lens=12/math.tan(math.radians(sample["fov"])/2)
    camera.data.shift_y=-sample["lensShift"]/2
    camera.data.dof.use_dof=sample["backgroundBokeh"]>.1 or poster
    camera.data.dof.focus_distance=sample["focusDistance"]
    camera.data.dof.aperture_fstop=4.0
    scene.use_nodes=False
    p=sample["p"]
    rig=sample["foreground"]
    q=rig["quaternion"]
    transform=Quaternion((q[3],q[0],q[1],q[2])).to_matrix().to_4x4()
    transform.translation=Vector(rig["position"])
    foreground.matrix_world=BASIS.to_4x4() @ transform @ BASIS.to_4x4().inverted()
    for obj in poster_objects:
        obj.hide_render=not poster or rig["opacity"]==0
    for mat in [smoke,fire,dust]:
        mat.node_tree.nodes.get("Noise Texture").inputs["W"].default_value=p*15
    for x,onset,radius,objects,dust_obj,light,debris,shock,trail,missile in blasts:
        active=p>=onset
        age=max(0,(p-onset)/.2)
        grow=1-(1-min(age/.3,1))**3
        for obj,offset,factor,is_fire in objects:
            obj.hide_render=not active
            rise=age*2.6*max(0,(offset.y-.7)/2.0) if not is_fire else age*.5
            bloom=1+.8*math.exp(-((age-.35)/.30)**2) if is_fire else 1
            spread=Vector((offset.x*bloom,offset.y,offset.z))
            obj.location=xyz(Vector((x, .4+rise,-30 if is_fire else -32))+spread*radius*grow)
            size=max(.002,radius*grow*factor*(max(.16,1-age*.45) if is_fire else 1+age*.3))
            obj.scale=(size*bloom,size*.85,size*(1.3 if not is_fire else 1.15))
        dust_obj.hide_render=not active
        dust_obj.scale=(max(.01,age*6),max(.01,age*3.5),max(.01,.35+age*.4))
        light.data.energy=(24000*math.exp(-age/.035)+9000*math.exp(-age*2.8)) if active else 0
        seconds=max(0,(p-onset)*8)
        for obj,velocity,spin in debris:
            obj.hide_render=not active or seconds>1.8
            position=Vector((x,.3,-31))+velocity*seconds+Vector((0,-4.9*seconds*seconds,0))
            position.y=max(.08,position.y)
            obj.location=xyz(position)
            obj.rotation_euler=spin*seconds*7
        shock.hide_render=not active
        shock.scale=(max(.01,seconds*9),max(.01,seconds*9),max(.05,.6/(1+seconds*3)))
        approach=(p-.54)/(onset-.54)
        trail.hide_render=missile.hide_render=not (.54<=p<onset)
        if .54<=p<onset:
            end=Vector((x,.8,-31))
            start=Vector((x+(-22 if x<1 else 24),22,-45))
            head=start.lerp(end,approach)
            tail=start.lerp(end,max(0,approach-.16))
            missile.location=xyz(head)
            direction=xyz(end-start)
            missile.rotation_euler=direction.to_track_quat("Y","Z").to_euler()
            spline=trail.data.splines[0]
            spline.points[0].co=(*xyz(head),1)
            spline.points[1].co=(*xyz(tail),1)
    bpy.context.view_layer.update()


def render(sample,name,width=1912,height=800,poster=False):
    dest=OUT/f"{name}.png"
    if dest.exists():
        return
    state_at(sample,width,height,poster)
    scene.render.filepath=str(dest)
    started=time.time()
    bpy.ops.render.render(write_still=True)
    measurement={"name":name,"p":sample["p"],"seconds":round(time.time()-started,2),"samples":args.samples if args.engine=="cycles" else scene.eevee.taa_render_samples,"width":width,"height":height,"engine":"Cycles CPU" if args.engine=="cycles" else "EEVEE offline GPU","blender":bpy.app.version_string}
    with (OUT/"render-benchmark.jsonl").open("a") as stream:
        stream.write(json.dumps(measurement)+"\n")
    print("BENCHMARK "+json.dumps(measurement),flush=True)


state_at(CAL["samples"][0])
for point in [(-9.5,0,-35),(-4.06,1.15,-31),(.43,1.15,-31),(4.92,1.15,-31),(-7.3,7.9,-38)]:
    projected=world_to_camera_view(scene,camera,xyz(point))
    d=6-point[2]
    expected=((1+point[0]/(d*math.tan(math.radians(17))*2.39))/2,(1+.35-(point[1]-1.65)/(d*math.tan(math.radians(17))))/2)
    assert abs(projected.x-expected[0])<1e-5 and abs((1-projected.y)-expected[1])<1e-5,(point,tuple(projected),expected)
print("PASS Blender landmark projection matches Three.js calibration",flush=True)
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/"games-hybrid.blend"),compress=True)
if args.macro:
    render(next(s for s in CAL["samples"] if s["p"]==.42),"macro-0.42",poster=True)
if args.preview:
    for p in map(float,args.points.split(",")):
        render(next(s for s in CAL["samples"] if s["p"]==p),f"preview-{p:.2f}")
if args.posters:
    for i,p in enumerate([.1,.42,.72,.93]):
        render(next(s for s in CAL["samples"] if s["p"]==p),f"poster-landscape-{i}",poster=True)
        render(CAL["portrait"]["samples"][i],f"poster-portrait-{i}",780,1688,poster=True)
if args.all:
    for i,sample in enumerate(CAL["samples"]):
        render(sample,f"frame-{i:04d}")
    for i,p in enumerate([.1,.42,.72,.93]):
        render(next(s for s in CAL["samples"] if s["p"]==p),f"poster-landscape-{i}",poster=True)
        render(CAL["portrait"]["samples"][i],f"poster-portrait-{i}",780,1688,poster=True)
