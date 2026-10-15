import { expect, test } from "@playwright/test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Worker } from "node:worker_threads";
import { runInNewContext } from "node:vm";
import { transpileModule, ModuleKind, JsxEmit } from "typescript";
import { LedgerStore, getLedgerStore } from "../src/lib/ledgerStore";
import { isKnowledgeAdmin } from "../src/lib/adminAuth";
import { dispatchEmail, generateWelcomeEmailHtml, saveSubscriber } from "../src/lib/email";
import { saveKnowledgeItem, searchKnowledge } from "../src/lib/knowledge";
import { POST as joinMembership } from "../src/app/api/members/join/route";
import { POST as subscribe } from "../src/app/api/stay-in-sangam/route";
import { POST as editKnowledge, DELETE as deleteKnowledge } from "../src/app/api/knowledge/route";
import { NextRequest } from "next/server";
import { governor } from "../src/engine/governor";
import { masterTick, resetMasterClock } from "../src/engine/masterTick";
import { registerRenderer, rendererAdvance, setSceneVisible, unregisterRenderer } from "../src/engine/renderer";
import { runFsmUnitTests } from "../src/components/guide-hero/board/fsm.test";
import { runLayoutUnitTests } from "../src/components/guide-hero/board/layout.test";
import { runFaqEngagementUnitTests } from "../src/lib/faq-engagement/contracts.test";
import { submitSuggestion } from "../src/app/actions/suggestion";

test.describe("recovered code review regressions", () => {
  let directory: string;
  let previousEnvironment: NodeJS.ProcessEnv;

  test.beforeAll(() => {
    previousEnvironment = { ...process.env };
    directory = mkdtempSync(join(tmpdir(), "sangam-review-"));
    process.env.SANGAM_DATA_DIR = directory;
    process.env.KNOWLEDGE_ADMIN_TOKEN = "test-admin-token";
    delete process.env.RESEND_API_KEY;
    delete process.env.NEWSLETTER_WEBHOOK_URL;
  });

  test.afterAll(() => {
    getLedgerStore().close();
    process.env = previousEnvironment;
    // Only remove the temporary directory this test created.
    if (resolve(directory).startsWith(resolve(tmpdir()) + "\\") || resolve(directory).startsWith(resolve(tmpdir()) + "/")) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  test("knowledge mutations reject missing and incorrect admin credentials", async () => {
    const request = (token?: string) => new NextRequest("http://localhost/api/knowledge", {
      method: "POST", headers: token ? { authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ titleEn: "Test", contentEn: "Test content" }),
    });
    expect(isKnowledgeAdmin(request())).toBe(false);
    expect(isKnowledgeAdmin(request("wrong"))).toBe(false);
    expect(isKnowledgeAdmin(request("test-admin-token"))).toBe(true);
    expect((await editKnowledge(request())).status).toBe(401);
    expect((await deleteKnowledge(request("wrong"))).status).toBe(401);
    expect((await editKnowledge(request("test-admin-token"))).status).toBe(200);
  });

  test("legacy records survive concurrent workers and failed transactions", async () => {
    const legacy = join(directory, "concurrent.json");
    writeFileSync(legacy, JSON.stringify(["legacy"]));
    const filename = resolve("src/lib/ledgerStore.ts");
    const source = transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ModuleKind.CommonJS },
    }).outputText;
    await Promise.all(Array.from({ length: 10 }, (_, id) => new Promise<void>((done, reject) => {
      const worker = new Worker(`
        const { workerData } = require('node:worker_threads');
        const Module = require('node:module');
        const module = new Module(workerData.filename);
        module._compile(workerData.source, workerData.filename);
        const store = new module.exports.LedgerStore(workerData.directory);
        store.update('concurrent.json', () => [], rows => rows.push(workerData.id));
        store.close();
      `, { eval: true, workerData: { filename, source, directory, id } });
      worker.on("error", reject);
      worker.on("exit", code => code === 0 ? done() : reject(new Error(`Worker exit ${code}`)));
    })));
    const store = new LedgerStore(directory);
    try {
      expect(store.read("concurrent.json", () => [])).toHaveLength(11);
      expect(readFileSync(legacy, "utf8")).toBe('["legacy"]');
      expect(() => store.update("concurrent.json", () => [], rows => {
        rows.length = 0;
        throw new Error("rollback probe");
      })).toThrow("rollback probe");
      expect(store.read("concurrent.json", () => [])).toHaveLength(11);
    } finally { store.close(); }
  });

  test("membership validates, persists, and acknowledges saved submissions", async () => {
    const request = (body: unknown) => new NextRequest("http://localhost/api/members/join", {
      method: "POST", body: JSON.stringify(body),
    });
    expect((await joinMembership(request({ name: "Student", email: "invalid", membershipType: "general" }))).status).toBe(400);
    const response = await joinMembership(request({ name: " Student ", email: "STUDENT@osu.edu", membershipType: "general" }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true });
    expect(getLedgerStore().read("members.json", () => [] as { name: string; email: string }[]))
      .toEqual([expect.objectContaining({ name: "Student", email: "student@osu.edu" })]);
  });

  test("subscriber saves retain every record and update duplicates", async () => {
    await Promise.all(Array.from({ length: 10 }, (_, id) => saveSubscriber({ email: `student${id}@osu.edu`, isBuckeye: true })));
    const updated = await saveSubscriber({ email: "student0@osu.edu", isBuckeye: true, name: "Updated" });
    expect(updated.total).toBe(10);
    expect(updated.isNew).toBe(false);
    expect(updated.record.name).toBe("Updated");
  });

  test("failed storage returns failure and keeps the existing store usable", async () => {
    getLedgerStore().update("storage-probe.json", () => [] as string[], rows => rows.push("saved"));
    const blocker = join(directory, "not-a-directory");
    writeFileSync(blocker, "storage failure probe");
    process.env.SANGAM_DATA_DIR = join(blocker, "child");
    try {
      const response = await joinMembership(new NextRequest("http://localhost/api/members/join", {
        method: "POST", body: JSON.stringify({ name: "Student", email: "failed@osu.edu", membershipType: "general" }),
      }));
      expect(response.status).toBe(503);
      expect((await response.json()).success).toBe(false);
      await expect(saveSubscriber({ email: "failed@osu.edu", isBuckeye: true })).rejects.toThrow();
    } finally { process.env.SANGAM_DATA_DIR = directory; }
    expect(getLedgerStore().read("storage-probe.json", () => [])).toEqual(["saved"]);
  });

  test("email HTML escapes user names and interests", () => {
    const { html } = generateWelcomeEmailHtml({ email: "student@osu.edu", isBuckeye: true,
      name: '<a href="https://evil.test">Student</a>', interests: ["<img src=x>"] });
    expect(html).not.toContain('<a href="https://evil.test">');
    expect(html).not.toContain("<img src=x>");
    expect(html).toContain("&lt;a href=");
    expect(html).toContain("&lt;img src=x&gt;");
  });

  test("no provider records attempts without claiming delivery", async () => {
    const result = await dispatchEmail({ to: "student@osu.edu", subject: "Test", html: "Test", text: "Test" });
    expect(result.success).toBe(false);
    const response = await subscribe(new NextRequest("http://localhost/api/stay-in-sangam", {
      method: "POST", body: JSON.stringify({ email: "newsletter@osu.edu" }),
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, emailDelivered: false,
      message: "Vanakkam! Your subscription is saved. Confirmation email is currently unavailable." });
  });

  test("provider failure uses bounded attempts and suggestion emails escape names", async () => {
    const originalFetch = globalThis.fetch;
    const requests: { html: string; signal: AbortSignal }[] = [];
    process.env.RESEND_API_KEY = "test-key";
    try {
      globalThis.fetch = async (_input, options) => {
        requests.push({ html: JSON.parse(options!.body as string).html, signal: options!.signal as AbortSignal });
        return Response.json({ id: "test-message" });
      };
      const form = new FormData();
      form.set("message", "A new event suggestion");
      form.set("name", '<a href="https://evil.test">Student</a>');
      form.set("email", "suggestion@osu.edu");
      const result = await submitSuggestion({ success: false }, form);
      expect(result.success).toBe(true);
      expect(requests).toHaveLength(2);
      for (const request of requests) {
        expect(request.html).toContain("&lt;a href=");
        expect(request.html).not.toContain('<a href="https://evil.test">');
        expect(request.signal).toBeInstanceOf(AbortSignal);
      }
      globalThis.fetch = async () => Response.json({ error: "provider unavailable" }, { status: 503 });
      expect((await dispatchEmail({ to: "student@osu.edu", subject: "Test", html: "Test", text: "Test" })).success).toBe(false);
    } finally {
      globalThis.fetch = originalFetch;
      delete process.env.RESEND_API_KEY;
    }
  });

  test("existing board layout, flap motion, and FAQ contracts stay green", () => {
    for (const result of [...runFsmUnitTests(), ...runLayoutUnitTests(), ...runFaqEngagementUnitTests()]) {
      expect(result.passed, `${result.test}: ${result.message ?? ""}`).toBe(true);
    }
  });

  test("Tamil phrases and individual tokens search Tamil fields", async () => {
    await saveKnowledgeItem({ id: "tamil-test", titleEn: "Unique test", contentEn: "Unique content",
      titleTa: "தமிழ் விழா", contentTa: "மாணவர்கள் அனைவரும் வரவேற்கப்படுகிறார்கள்", keywords: [] });
    expect(searchKnowledge("தமிழ் விழா")[0].item.id).toBe("tamil-test");
    expect(searchKnowledge("மாணவர்கள் எப்படி").some(result => result.item.id === "tamil-test")).toBe(true);
  });

  test("ambient rendering stays at 30 FPS across display refresh rates and pauses", () => {
    const originalNow = performance.now.bind(performance);
    let now = 5000;
    Object.defineProperty(performance, "now", { configurable: true, value: () => now });
    setSceneVisible("ambient-test", true);
    try {
      for (const hz of [60, 120, 144]) {
        let renders = 0;
        governor.clear();
        resetMasterClock();
        registerRenderer({ domElement: { style: {} } } as Parameters<typeof registerRenderer>[0], () => renders++);
        governor.request("test", 1);
        for (let tick = 0; tick < hz; tick++) {
          now = 5000 + tick * 1000 / hz;
          masterTick(now / 1000, null);
        }
        expect(renders, `${hz} Hz ambient rendering`).toBe(30);
        governor.request("test", 0);
        masterTick(7, null);
        expect(renders).toBe(30);
      }
    } finally {
      Object.defineProperty(performance, "now", { configurable: true, value: originalNow });
      unregisterRenderer();
      setSceneVisible("ambient-test", false);
      governor.clear();
      resetMasterClock();
    }
  });

  test("renderer pauses without visible scenes or while document is hidden", () => {
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
    const gl = { domElement: { style: { visibility: "" } } } as Parameters<typeof registerRenderer>[0];
    const frames: number[] = [];
    try {
      registerRenderer(gl, timestamp => frames.push(timestamp));
      rendererAdvance(1);
      expect(frames).toEqual([]);
      expect(gl.domElement.style.visibility).toBe("hidden");

      setSceneVisible("renderer-test-a", true);
      rendererAdvance(2);
      expect(frames).toEqual([2]);
      expect(gl.domElement.style.visibility).toBe("visible");
      setSceneVisible("renderer-test-b", true);
      setSceneVisible("renderer-test-a", false);
      rendererAdvance(3);
      expect(frames).toEqual([2, 3]);

      Object.defineProperty(globalThis, "document", { configurable: true, value: { hidden: true } });
      rendererAdvance(4);
      expect(frames).toEqual([2, 3]);
      Object.defineProperty(globalThis, "document", { configurable: true, value: { hidden: false } });
      unregisterRenderer();
      rendererAdvance(5);
      expect(frames).toEqual([2, 3]);
      registerRenderer(gl, timestamp => frames.push(timestamp));
      rendererAdvance(6);
      expect(frames).toEqual([2, 3, 6]);
      setSceneVisible("renderer-test-b", false);
      rendererAdvance(7);
      expect(frames).toEqual([2, 3, 6]);
      expect(gl.domElement.style.visibility).toBe("hidden");
    } finally {
      unregisterRenderer();
      setSceneVisible("renderer-test-a", false);
      setSceneVisible("renderer-test-b", false);
      if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
      else Reflect.deleteProperty(globalThis, "document");
    }
  });

  test("saved render tiers respect capability and motion fallbacks without repeated probes", () => {
    const code = transpileModule(readFileSync(resolve("src/components/providers/TierProvider.tsx"), "utf8"), {
      compilerOptions: { module: ModuleKind.CommonJS, jsx: JsxEmit.React, esModuleInterop: true },
    }).outputText;
    const mount = (saved: string, supported: boolean | "throws") => {
      const states: unknown[] = [];
      let frame = () => {};
      let probes = 0;
      let mediaChange = () => {};
      let contextLoss: (event: Event) => void = () => {};
      let capture = false;
      const media = {
        matches: false,
        addEventListener: (_: string, listener: () => void) => { mediaChange = listener; },
        removeEventListener: () => {},
      };
      const react = {
        createContext: () => ({}), createElement: () => null, useCallback: (fn: unknown) => fn,
        useState: (value: unknown) => {
          const index = states.push(value) - 1;
          return [value, (next: unknown) => { states[index] = next; }];
        },
        useEffect: (effect: () => void) => effect(),
      };
      const exports = {} as { TierProvider: (props: { children: null }) => void };
      runInNewContext(code, {
        exports, require: () => react,
        window: {
          matchMedia: () => media,
          addEventListener: (_: string, listener: (event: Event) => void, useCapture: boolean) => {
            contextLoss = listener;
            capture = useCapture;
          },
          removeEventListener: () => {},
        },
        navigator: { userAgent: "" }, localStorage: { getItem: () => saved },
        document: { createElement: () => ({ getContext: () => {
          probes++;
          if (supported === "throws") throw new Error("WebGL unavailable");
          return supported ? { getExtension: () => null } : null;
        } }) },
        requestAnimationFrame: (callback: () => void) => { frame = callback; return 1; },
        cancelAnimationFrame: () => {}, console: { warn: () => {} },
      });
      exports.TierProvider({ children: null });
      frame();
      return {
        tier: () => states[0], probes: () => probes,
        motion: (reduced: boolean) => { media.matches = reduced; mediaChange(); },
        loseContext: () => {
          const event = new Event("webglcontextlost", { cancelable: true });
          contextLoss(event);
          expect(capture).toBe(true);
          expect(event.defaultPrevented).toBe(true);
        },
      };
    };
    for (const saved of ["A", "B"]) expect(mount(saved, false).tier()).toBe("C");
    expect(mount("A", "throws").tier()).toBe("C");
    const lite = mount("C", true);
    expect(lite.tier()).toBe("C");
    expect(lite.probes()).toBe(0);
    const active = mount("A", true);
    expect(active.tier()).toBe("A");
    active.motion(true);
    expect(active.tier()).toBe("C");
    active.motion(false);
    expect(active.tier()).toBe("A");
    expect(active.probes()).toBe(1);
    active.loseContext();
    active.motion(false);
    expect(active.tier()).toBe("C");
  });
});

test("membership UI shows failures and succeeds only after acknowledgement", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("sangam_tier", "C");
    localStorage.setItem("sangam_lite_mode", "true");
    sessionStorage.setItem("sangam_boot_shown", "true");
  });
  await page.route("**/api/members/join", route => route.fulfill({ status: 503,
    contentType: "application/json", body: JSON.stringify({ success: false, error: "Unable to save membership" }) }));
  await page.goto("/join");
  await page.locator('input[type="text"]').first().fill("Student");
  await page.locator('input[type="email"]').first().fill("student@osu.edu");
  await page.getByRole("button", { name: "Sign the Guestbook" }).click();
  await expect(page.getByText("Unable to save membership", { exact: true })).toBeVisible();
  await page.unroute("**/api/members/join");
  await page.route("**/api/members/join", route => route.fulfill({ status: 201,
    contentType: "application/json", body: JSON.stringify({ success: true }) }));
  await page.getByRole("button", { name: "Sign the Guestbook" }).click();
  await expect(page.getByText("Guestbook Signed Successfully", { exact: true })).toBeVisible();
});

test("closing diagnostics cancels its latest animation callback", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("sangam_tier", "C");
    localStorage.setItem("sangam_lite_mode", "true");
    sessionStorage.setItem("sangam_boot_shown", "true");
    const pending = new Set<number>();
    const request = window.requestAnimationFrame.bind(window);
    const cancel = window.cancelAnimationFrame.bind(window);
    (window as unknown as { __reviewPendingFrames: Set<number> }).__reviewPendingFrames = pending;
    window.requestAnimationFrame = callback => {
      if (!callback.name.includes("frameCounter")) return request(callback);
      const id = request(time => {
        pending.delete(id);
        callback(time);
      });
      pending.add(id);
      return id;
    };
    window.cancelAnimationFrame = id => { pending.delete(id); cancel(id); };
  });
  await page.goto("/join?director=1");
  await page.keyboard.press("Shift+D");
  await expect(page.getByLabel("Director Diagnostic Viewport")).toBeVisible();
  const pending = () => page.evaluate(() =>
    (window as unknown as { __reviewPendingFrames: Set<number> }).__reviewPendingFrames.size);
  await expect.poll(pending).toBe(1);
  await page.getByRole("button", { name: "Close Director Viewport (Escape)", exact: true }).click();
  await expect.poll(pending).toBe(0);
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 375, height: 812 }]) {
  test(`reviewed routes render at ${viewport.width}px and release hidden heroes`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      localStorage.setItem("sangam_tier", "A");
      sessionStorage.setItem("sangam_boot_shown", "true");
    });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const [route, key] of [["/", "home-hero"], ["/board", "board-corridor"],
      ["/gallery", "gallery-hero"], ["/join", "join-hero"]]) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await page.evaluate(async () => { await document.fonts.ready; });
      await expect.poll(() => page.evaluate(() => Boolean(
        (window as unknown as { __governor?: unknown }).__governor
      ))).toBe(true);
      await expect(page.getByText(/Loading student leadership colonnade|Entering the morning campus/)).toHaveCount(0, { timeout: 30_000 });
      await page.evaluate(() => {
        if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true });
        else window.scrollTo(0, 0);
      });
      await expect.poll(() => page.evaluate(requestKey =>
        (window as unknown as { __governor: { getAsks(): Record<string, number> } }).__governor.getAsks()[requestKey] ?? 0,
      key), { timeout: 10_000, message: `${route}: visible hero should request frames` }).toBeGreaterThan(0);
      await page.screenshot({ path: testInfo.outputPath(`${route.slice(1) || "home"}.png`) });
      const preloadCount = await page.locator('link[rel="preload"][as="font"]').count();
      expect(preloadCount).toBeLessThan(16);
      await page.evaluate(() => {
        window.__lenis?.resize();
        const target = document.documentElement.scrollHeight;
        if (window.__lenis) window.__lenis.scrollTo(target, { immediate: true, force: true });
        else window.scrollTo(0, target);
      });
      await expect.poll(() => page.evaluate(requestKey => {
        const state = (window as unknown as { __governor: { getAsks(): Record<string, number> } }).__governor;
        return state.getAsks()[requestKey] ?? 0;
      }, key), { timeout: 15_000, message: `${route}: ${key} should release its render request` }).toBe(0);
    }
    expect(errors).toEqual([]);
  });
}
