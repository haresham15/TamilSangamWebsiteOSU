"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { seededRandom } from "@/lib/prng";

// ---------------------------------------------------------------------------
// 4K High-Detail Procedural Texture for Leo / Naa Ready Factory Back Wall
// ---------------------------------------------------------------------------

function createLeoBackWallTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Dark Weathered Heavy Industrial Concrete Base
  ctx.fillStyle = "#110f13";
  ctx.fillRect(0, 0, 4096, 2048);

  // Concrete slabs and expansion seams (vertical & horizontal panels)
  ctx.strokeStyle = "rgba(28, 24, 32, 0.85)";
  ctx.lineWidth = 3;
  const panelW = 512;
  const panelH = 512;
  for (let x = 0; x <= 4096; x += panelW) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 2048);
    ctx.stroke();

    // Rivet studs along panel seams
    for (let y = 16; y < 2048; y += 48) {
      ctx.fillStyle = "rgba(45, 40, 52, 0.7)";
      ctx.beginPath();
      ctx.arc(x - 6, y, 3, 0, Math.PI * 2);
      ctx.arc(x + 6, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (let y = 0; y <= 2048; y += panelH) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(4096, y);
    ctx.stroke();
  }

  // Industrial masonry brick pattern in background
  ctx.strokeStyle = "rgba(42, 36, 46, 0.35)";
  ctx.lineWidth = 1.8;
  const rowHeight = 36;
  const colWidth = 96;
  for (let y = 0; y < 2048; y += rowHeight) {
    const offset = (Math.floor(y / rowHeight) % 2) * (colWidth / 2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(4096, y);
    ctx.stroke();
    for (let x = offset; x < 4096; x += colWidth) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowHeight);
      ctx.stroke();
    }
  }

  // Grimy grunge, furnace soot and grease streaks
  for (let i = 0; i < 75; i++) {
    const sx = Math.random() * 4096;
    const grad = ctx.createLinearGradient(sx, 0, sx + (Math.random() - 0.5) * 120, 2048);
    grad.addColorStop(0, "rgba(5, 4, 6, 0.9)");
    grad.addColorStop(0.35, "rgba(22, 17, 15, 0.45)");
    grad.addColorStop(1, "rgba(8, 7, 10, 0.95)");
    ctx.fillStyle = grad;
    ctx.fillRect(sx, 0, 50 + Math.random() * 140, 2048);
  }

  // Heavy rust drips from roofline and catwalk beam
  for (let i = 0; i < 120; i++) {
    const rx = Math.random() * 4096;
    const rlen = 100 + Math.random() * 650;
    const rgrad = ctx.createLinearGradient(rx, 0, rx, rlen);
    rgrad.addColorStop(0, "rgba(180, 75, 20, 0.75)");
    rgrad.addColorStop(0.6, "rgba(110, 42, 12, 0.3)");
    rgrad.addColorStop(1, "transparent");
    ctx.fillStyle = rgrad;
    ctx.fillRect(rx, 0, 5 + Math.random() * 14, rlen);
  }

  // Lower zone splash grime
  for (let i = 0; i < 65; i++) {
    const rx = Math.random() * 4096;
    const rlen = 150 + Math.random() * 400;
    const rgrad = ctx.createLinearGradient(rx, 2048, rx, 2048 - rlen);
    rgrad.addColorStop(0, "rgba(8, 6, 5, 0.85)");
    rgrad.addColorStop(0.7, "rgba(25, 18, 12, 0.35)");
    rgrad.addColorStop(1, "transparent");
    ctx.fillStyle = rgrad;
    ctx.fillRect(rx, 2048 - rlen, 25 + Math.random() * 80, rlen);
  }

  ctx.save();

  // =========================================================================
  // 2. CENTRAL MASTER STENCIL MURAL: LEO DASS & "NAA READY"
  // Centered at cx = 2048, cy = 820 (Upper Register, Unobstructed under Catwalk)
  // =========================================================================
  const cx = 2048;
  const cy = 920;

  // Stenciled Roaring Lion Profile Silhouette & Radiant Aura
  ctx.save();
  const lionGlow = ctx.createRadialGradient(cx, cy - 80, 40, cx, cy - 80, 390);
  lionGlow.addColorStop(0, "rgba(255, 175, 35, 0.38)");
  lionGlow.addColorStop(0.5, "rgba(200, 115, 20, 0.18)");
  lionGlow.addColorStop(1, "transparent");
  ctx.fillStyle = lionGlow;
  ctx.beginPath();
  ctx.arc(cx, cy - 80, 390, 0, Math.PI * 2);
  ctx.fill();

  // Lion head stylized profile silhouette in dark distressed gold
  ctx.fillStyle = "rgba(240, 175, 45, 0.3)";
  ctx.beginPath();
  ctx.arc(cx, cy - 80, 190, 0, Math.PI * 2);
  ctx.fill();

  // Geometric Lion Mane radiant rays
  ctx.strokeStyle = "rgba(255, 190, 55, 0.42)";
  ctx.lineWidth = 7;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 18) {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 190, cy - 80 + Math.sin(a) * 190);
    ctx.lineTo(cx + Math.cos(a) * 310, cy - 80 + Math.sin(a) * 310);
    ctx.stroke();
  }
  ctx.restore();

  // Central Stencil Typography
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Arch Header above Lion
  ctx.font = "bold 40px 'Courier New', monospace";
  ctx.fillStyle = "rgba(245, 158, 11, 0.9)";
  ctx.fillText("★ LEO DASS ORDNANCE & CONFECTIONERY FACILITY ★", cx, cy - 235);

  // Massive "L E O" Headline Stencil
  ctx.font = "900 160px 'Impact', 'Arial Black', sans-serif";
  ctx.fillStyle = "rgba(10, 8, 6, 0.95)";
  ctx.fillText("L  E  O", cx + 5, cy - 75);
  ctx.fillStyle = "rgba(255, 215, 80, 0.9)";
  ctx.fillText("L  E  O", cx, cy - 80);

  // "— BLOODY SWEET —" Stamped in bold distressed crimson
  ctx.font = "900 68px 'Courier New', monospace";
  ctx.fillStyle = "rgba(15, 10, 10, 0.95)";
  ctx.fillText("— BLOODY SWEET —", cx + 4, cy + 34);
  ctx.fillStyle = "rgba(235, 45, 45, 0.95)";
  ctx.fillText("— BLOODY SWEET —", cx, cy + 30);

  // Bilingual Signature Slogan: "நான் ரெடி தான் வரவா? · NAA READY THAAN VARAVAA?"
  // Tamil Primary Headline in Radiant Cream-Gold
  ctx.font = "bold 80px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(15, 10, 5, 0.95)";
  ctx.fillText("நான் ரெடி தான் வரவா?", cx + 5, cy + 135);
  ctx.fillStyle = "rgba(255, 240, 190, 0.95)";
  ctx.fillText("நான் ரெடி தான் வரவா?", cx, cy + 130);

  // English Subtitle
  ctx.font = "900 52px 'Arial Black', sans-serif";
  ctx.fillStyle = "rgba(245, 175, 45, 0.9)";
  ctx.fillText("NAA READY THAAN VARAVAA?", cx, cy + 205);

  // Heavy Industrial Facility Badge & Institutional Sub-text
  ctx.font = "bold 30px 'Courier New', monospace";
  ctx.fillStyle = "rgba(85, 204, 162, 0.95)";
  ctx.fillText("[ TAMIL SANGAM · THE OHIO STATE UNIVERSITY · COLUMBUS, OH ]", cx, cy + 275);

  ctx.font = "bold 23px 'Courier New', monospace";
  ctx.fillStyle = "rgba(220, 190, 130, 0.8)";
  ctx.fillText("HEAVY ORDNANCE PRODUCTION UNIT 01  ·  BATCH #2026-TS-OSU", cx, cy + 320);

  // =========================================================================
  // 3. MIDDLE REGISTER DIRECTLY BEHIND & FLANKING THE COIN (cy ≈ 1520 - 1650)
  // Eye-Level Industrial Machinery Placards, Tamil Slogans, Calibration Reticle
  // =========================================================================

  // 3A. Giant Concentric Turntable Calibration Reticle (Behind the Spinning Medallion)
  const reticleY = 1575;
  ctx.save();
  ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
  ctx.lineWidth = 2.5;

  // Outer calibration circle
  ctx.beginPath();
  ctx.arc(cx, reticleY, 360, 0, Math.PI * 2);
  ctx.stroke();

  // Mid calibration circle
  ctx.beginPath();
  ctx.arc(cx, reticleY, 260, 0, Math.PI * 2);
  ctx.stroke();

  // Inner calibration circle
  ctx.beginPath();
  ctx.arc(cx, reticleY, 140, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(cx - 390, reticleY);
  ctx.lineTo(cx + 390, reticleY);
  ctx.moveTo(cx, reticleY - 390);
  ctx.lineTo(cx, reticleY + 390);
  ctx.stroke();

  // Degree tick marks every 10 degrees
  ctx.lineWidth = 1.5;
  for (let deg = 0; deg < 360; deg += 10) {
    const rad = (deg * Math.PI) / 180;
    const len = deg % 30 === 0 ? 24 : 12;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * (360 - len), reticleY + Math.sin(rad) * (360 - len));
    ctx.lineTo(cx + Math.cos(rad) * 360, reticleY + Math.sin(rad) * 360);
    ctx.stroke();
  }

  // Circular Stencil Legend
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillStyle = "rgba(245, 158, 11, 0.65)";
  ctx.fillText("★ TAMIL SANGAM ORDNANCE • 2026 EDITION • TURNTABLE CALIBRATION RETICLE ★", cx, reticleY - 290);
  ctx.font = "bold 20px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255, 235, 175, 0.65)";
  ctx.fillText("சுழற்சி மையப்புள்ளி · தூய தமிழ் மரபு · ஓஹையோ தமிழ்ச் சங்கம்", cx, reticleY + 290);
  ctx.restore();

  // 3B. Left Middle Register: Machine Specification & Safety Mandates (Behind Left Crowd)
  const lmx = 850;
  ctx.strokeStyle = "rgba(200, 130, 10, 0.45)";
  ctx.lineWidth = 3.5;
  ctx.strokeRect(lmx - 450, 1340, 900, 370);
  ctx.fillStyle = "rgba(200, 130, 10, 0.04)";
  ctx.fillRect(lmx - 450, 1340, 900, 370);

  ctx.textAlign = "left";
  ctx.font = "900 40px 'Impact', sans-serif";
  ctx.fillStyle = "rgba(255, 215, 80, 0.92)";
  ctx.fillText("HYDRAULIC FORGE LINE 04", lmx - 420, 1390);

  ctx.font = "bold 28px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255, 240, 190, 0.88)";
  ctx.fillText("ஹைட்ராலிக் பிரஸ் லைன் 04 · விசை அழுத்தம்: 12,000 PSI", lmx - 420, 1435);

  ctx.font = "bold 23px 'Courier New', monospace";
  ctx.fillStyle = "rgba(200, 195, 185, 0.85)";
  const leftMidSpecs = [
    "OPERATING TONNAGE: 500 TONS CONTINUOUS",
    "FLUID SPECIFICATION: HYD-OIL ISO VG 68",
    "⚠ CAUTION: EYE & EAR PROTECTION MANDATORY",
    "⚠ ஆபத்து: சுழலும் பாகங்கள் · ஒதுங்கி நிற்கவும்",
    "LAST CALIBRATION: SEP 2026 · INSPECTION PASSED",
    "SERIAL: TS-OSU-FORGE-2026-B4",
  ];
  leftMidSpecs.forEach((txt, idx) => {
    ctx.fillText(txt, lmx - 420, 1485 + idx * 36);
  });

  // 3C. Right Middle Register: Armory Division & Tamil Pride (Behind Right Crowd)
  const rmx = 3240;
  ctx.strokeStyle = "rgba(180, 30, 30, 0.45)";
  ctx.lineWidth = 3.5;
  ctx.strokeRect(rmx - 450, 1340, 900, 370);
  ctx.fillStyle = "rgba(180, 30, 30, 0.04)";
  ctx.fillRect(rmx - 450, 1340, 900, 370);

  ctx.textAlign = "left";
  ctx.font = "900 40px 'Impact', sans-serif";
  ctx.fillStyle = "rgba(255, 80, 80, 0.95)";
  ctx.fillText("LEO DASS ARMORY DIVISION", rmx - 420, 1390);

  ctx.font = "bold 28px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255, 215, 180, 0.9)";
  ctx.fillText("லியோ தாஸ் ஆயுத கிடங்கு · கொலம்பஸ் பிரிவு", rmx - 420, 1435);

  ctx.font = "bold 23px 'Courier New', monospace";
  ctx.fillStyle = "rgba(200, 195, 185, 0.85)";
  const rightMidSpecs = [
    "SECURITY PROTOCOL: SANGAM LEVEL 04 RED",
    "உறுதி · ஒழுக்கம் · வெற்றி (RESOLVE · DISCIPLINE)",
    "வெற்றி நமதே! · VICTORY IS OURS!",
    "EMERGENCY EGRESS ROUTE: NORTH-EAST STAIR 02",
    "அங்கீகரிக்கப்பட்ட நபர்களுக்கு மட்டுமே அனுமதி",
    "AUTHORIZED TS-OSU SQUAD MEMBERS ONLY",
  ];
  rightMidSpecs.forEach((txt, idx) => {
    ctx.fillText(txt, rmx - 420, 1485 + idx * 36);
  });

  // =========================================================================
  // 4. LEFT UPPER WING: ZONE 04 WEAPONS FORGE & POWER GRID (X in [200, 1350])
  // =========================================================================
  const lx = 750;

  // Stenciled Zone Header Box
  ctx.textAlign = "center";
  ctx.strokeStyle = "rgba(200, 130, 10, 0.45)";
  ctx.lineWidth = 4;
  ctx.strokeRect(lx - 460, 480, 920, 110);
  ctx.fillStyle = "rgba(200, 130, 10, 0.05)";
  ctx.fillRect(lx - 460, 480, 920, 110);

  ctx.font = "900 48px 'Impact', sans-serif";
  ctx.fillStyle = "rgba(255, 205, 70, 0.9)";
  ctx.fillText("ZONE 04 : WEAPONS FORGE & FOUNDRY", lx, 525);
  ctx.font = "bold 30px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255, 235, 175, 0.85)";
  ctx.fillText("பிரிவு 04 : ஆயுத உலைக்களம் & பட்டறை", lx, 565);

  // Technical Specs Box
  ctx.textAlign = "left";
  ctx.font = "bold 26px 'Courier New', monospace";
  ctx.fillStyle = "rgba(200, 190, 175, 0.75)";
  const specLines = [
    "MACHINE ID: LATHE & PRESS LINE #03",
    "MAX OPERATING LOAD: 50,000 KG",
    "PRESSURE CHAMBER: 850 PSI TESTED",
    "FORGE TEMPERATURE: 1,450°C",
    "SERVICED: COLUMBUS DEPOT · 2026",
    "SERIAL: TS-OSU-1999-LEO-DASS",
  ];
  specLines.forEach((line, idx) => {
    ctx.fillText(line, lx - 440, 650 + idx * 42);
  });

  // High Voltage Warning Plate
  ctx.strokeStyle = "rgba(180, 30, 30, 0.55)";
  ctx.lineWidth = 4;
  ctx.strokeRect(lx - 440, 920, 880, 120);
  ctx.fillStyle = "rgba(180, 30, 30, 0.08)";
  ctx.fillRect(lx - 440, 920, 880, 120);

  ctx.textAlign = "center";
  ctx.font = "900 42px 'Arial Black', sans-serif";
  ctx.fillStyle = "rgba(255, 80, 80, 0.95)";
  ctx.fillText("⚡ DANGER : HIGH VOLTAGE 33,000V ⚡", lx, 960);
  ctx.font = "bold 30px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255, 180, 180, 0.9)";
  ctx.fillText("எச்சரிக்கை : அதீத மின்னழுத்தம் · விபத்து அபாயம்", lx, 1005);

  // Large Vertical Architectural Stencil: S E C T O R - 0 1
  ctx.font = "900 64px 'Impact', sans-serif";
  ctx.fillStyle = "rgba(245, 158, 11, 0.22)";
  const s1Letters = ["S", "E", "C", "T", "O", "R", "-", "0", "1"];
  s1Letters.forEach((char, idx) => {
    ctx.fillText(char, 220, 420 + idx * 80);
  });

  // Stenciled Blueprint Schematic of Sledgehammer & Gear
  ctx.strokeStyle = "rgba(85, 204, 162, 0.35)";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(lx - 440, 1080, 880, 230);
  ctx.beginPath();
  // Sledgehammer outline blueprint
  ctx.strokeRect(lx - 340, 1130, 140, 80);
  ctx.strokeRect(lx - 200, 1160, 420, 20);
  ctx.stroke();
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillStyle = "rgba(85, 204, 162, 0.75)";
  ctx.fillText("[ SCHEMATIC 04-A: SANGAM HEAVY SLEDGE · 1800mm HANDLE ]", lx + 40, 1240);
  ctx.font = "bold 20px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillText("ஆயுத வடிவமைப்பு திட்ட வரைபடம் · ஒப்புதல் பெற்றது", lx + 40, 1275);

  // =========================================================================
  // 5. RIGHT UPPER WING: LEO DASS CO. ORDNANCE & CONFECTIONERY (X in [2750, 3950])
  // =========================================================================
  const rx = 3350;

  // Stenciled Production Board Header
  ctx.textAlign = "center";
  ctx.strokeStyle = "rgba(200, 130, 10, 0.45)";
  ctx.lineWidth = 4;
  ctx.strokeRect(rx - 460, 480, 920, 110);
  ctx.fillStyle = "rgba(200, 130, 10, 0.05)";
  ctx.fillRect(rx - 460, 480, 920, 110);

  ctx.font = "900 48px 'Impact', sans-serif";
  ctx.fillStyle = "rgba(255, 205, 70, 0.9)";
  ctx.fillText("LEO DASS CO. : ORDNANCE LOT #07", rx, 525);
  ctx.font = "bold 30px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255, 235, 175, 0.85)";
  ctx.fillText("லியோ தாஸ் நிறுவனம் · கொலம்பஸ் பிரிவு", rx, 565);

  // Operational Directives
  ctx.textAlign = "left";
  ctx.font = "bold 26px 'Courier New', monospace";
  ctx.fillStyle = "rgba(200, 190, 175, 0.75)";
  const rightLines = [
    "OPERATION: KASHMIR TO COLUMBUS 2026",
    "DIVISION: CHOCOLATE & HEAVY ORDNANCE",
    "TARGET OUTPUT: 10,000 UNITS / DAY",
    "INSPECTION: PASSED BY CHIEF LEO DASS",
    "ACCESS LEVEL: CLASSIFIED Sangam RED",
    "RULE #01: NO MERCY. NO PROTOCOL.",
  ];
  rightLines.forEach((line, idx) => {
    ctx.fillText(line, rx - 440, 650 + idx * 42);
  });

  // Emergency Steam Cutoff Valve Decal
  ctx.strokeStyle = "rgba(200, 130, 10, 0.45)";
  ctx.lineWidth = 4;
  ctx.strokeRect(rx - 440, 920, 880, 120);
  ctx.fillStyle = "rgba(200, 130, 10, 0.05)";
  ctx.fillRect(rx - 440, 920, 880, 120);

  ctx.textAlign = "center";
  ctx.font = "900 38px 'Arial Black', sans-serif";
  ctx.fillStyle = "rgba(255, 215, 80, 0.95)";
  ctx.fillText("EMERGENCY STEAM SHUTOFF STATION 02", rx, 960);
  ctx.font = "bold 30px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255, 240, 190, 0.9)";
  ctx.fillText("அவசர கால நீராவி நிறுத்தம் · வால்வு 02", rx, 1005);

  // Bold Tamil Cultural Slogan: "தடையை உடை · வென்று காட்டு!"
  ctx.strokeStyle = "rgba(220, 38, 38, 0.7)";
  ctx.lineWidth = 3;
  ctx.strokeRect(rx - 440, 1080, 880, 230);
  ctx.fillStyle = "rgba(220, 38, 38, 0.08)";
  ctx.fillRect(rx - 440, 1080, 880, 230);

  ctx.font = "900 58px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255, 80, 80, 0.95)";
  ctx.fillText("தடையை உடை  ·  வென்று காட்டு!", rx, 1150);

  ctx.font = "900 42px 'Arial Black', sans-serif";
  ctx.fillStyle = "rgba(255, 215, 90, 0.9)";
  ctx.fillText("BREAK THE CAGE  ·  RISE VICTORIOUS", rx, 1215);

  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.fillStyle = "rgba(220, 190, 130, 0.75)";
  ctx.fillText("TAMIL SANGAM 2026  ·  OHIO STATE PRIDE", rx, 1265);

  // Large Vertical Architectural Stencil: S E C T O R - 0 2
  ctx.font = "900 64px 'Impact', sans-serif";
  ctx.fillStyle = "rgba(245, 158, 11, 0.22)";
  const s2Letters = ["S", "E", "C", "T", "O", "R", "-", "0", "2"];
  s2Letters.forEach((char, idx) => {
    ctx.fillText(char, 3880, 420 + idx * 80);
  });

  // =========================================================================
  // 6. UPPER BEAMS & RUNNING GANTRY WARNING (Y in [100, 320])
  // =========================================================================
  ctx.font = "900 36px 'Courier New', monospace";
  ctx.fillStyle = "rgba(245, 158, 11, 0.55)";
  ctx.fillText("TAMIL SANGAM HEAVY INDUSTRIAL WORKS · COLUMBUS, OH · 2026 EDITION · ALL PROTOCOLS ACTIVE", cx, 160);

  const topHazardY = 220;
  const stripeW = 50;
  for (let x = 0; x < 4096; x += stripeW * 2) {
    ctx.fillStyle = "rgba(245, 158, 11, 0.4)";
    ctx.beginPath();
    ctx.moveTo(x, topHazardY);
    ctx.lineTo(x + stripeW, topHazardY);
    ctx.lineTo(x + stripeW * 2, topHazardY + 36);
    ctx.lineTo(x + stripeW, topHazardY + 36);
    ctx.closePath();
    ctx.fill();
  }

  // =========================================================================
  // 7. LOWER HAZARD CHEVRON STRIPES (Y in [1880, 2048])
  // =========================================================================
  const bottomHazardY = 1880;
  const bStripeW = 60;
  for (let x = 0; x < 4096; x += bStripeW * 2) {
    ctx.fillStyle = "rgba(245, 158, 11, 0.55)";
    ctx.beginPath();
    ctx.moveTo(x, bottomHazardY);
    ctx.lineTo(x + bStripeW, bottomHazardY);
    ctx.lineTo(x + bStripeW * 2, 2048);
    ctx.lineTo(x + bStripeW, 2048);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(12, 11, 14, 0.85)";
    ctx.beginPath();
    ctx.moveTo(x + bStripeW, bottomHazardY);
    ctx.lineTo(x + bStripeW * 2, bottomHazardY);
    ctx.lineTo(x + bStripeW * 3, 2048);
    ctx.lineTo(x + bStripeW * 2, 2048);
    ctx.closePath();
    ctx.fill();
  }

  // Bottom Stenciled Floor Warning
  ctx.font = "900 34px 'Courier New', monospace";
  ctx.fillStyle = "rgba(255, 215, 80, 0.85)";
  ctx.fillText("⚠ KEEP CLEAR OF TURNTABLE PLATFORM · எப்போதும் ஒதுங்கி நிற்கவும் · TAMIL SANGAM 2026 ⚠", cx, 1835);

  // 8. Soft edge vignette falloff to dissolve corner signage and outer edges into darkness
  const leftEdgeGrad = ctx.createLinearGradient(0, 0, 950, 0);
  leftEdgeGrad.addColorStop(0, "rgba(6, 5, 7, 0.95)");
  leftEdgeGrad.addColorStop(0.5, "rgba(6, 5, 7, 0.5)");
  leftEdgeGrad.addColorStop(1, "transparent");
  ctx.fillStyle = leftEdgeGrad;
  ctx.fillRect(0, 0, 950, 2048);

  const rightEdgeGrad = ctx.createLinearGradient(4096, 0, 4096 - 950, 0);
  rightEdgeGrad.addColorStop(0, "rgba(6, 5, 7, 0.95)");
  rightEdgeGrad.addColorStop(0.5, "rgba(6, 5, 7, 0.5)");
  rightEdgeGrad.addColorStop(1, "transparent");
  ctx.fillStyle = rightEdgeGrad;
  ctx.fillRect(4096 - 950, 0, 950, 2048);

  const topEdgeGrad = ctx.createLinearGradient(0, 0, 0, 450);
  topEdgeGrad.addColorStop(0, "rgba(6, 5, 7, 0.95)");
  topEdgeGrad.addColorStop(1, "transparent");
  ctx.fillStyle = topEdgeGrad;
  ctx.fillRect(0, 0, 4096, 450);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 16;
  return texture;
}

// ---------------------------------------------------------------------------
// Procedural Side Wall Textures (Left & Right Bays)
// ---------------------------------------------------------------------------

function createSideWallTexture(side: "left" | "right"): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Dark industrial concrete
  ctx.fillStyle = "#121015";
  ctx.fillRect(0, 0, 2048, 1024);

  // Panel seams & studs
  ctx.strokeStyle = "rgba(28, 24, 32, 0.85)";
  ctx.lineWidth = 3;
  for (let x = 0; x <= 2048; x += 512) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();

    for (let y = 16; y < 1024; y += 48) {
      ctx.fillStyle = "rgba(45, 40, 52, 0.7)";
      ctx.beginPath();
      ctx.arc(x - 5, y, 2.5, 0, Math.PI * 2);
      ctx.arc(x + 5, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (let y = 0; y <= 1024; y += 512) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  // Rust & soot streaks
  for (let i = 0; i < 35; i++) {
    const rx = Math.random() * 2048;
    const rlen = 60 + Math.random() * 300;
    const rgrad = ctx.createLinearGradient(rx, 0, rx, rlen);
    rgrad.addColorStop(0, "rgba(180, 75, 20, 0.7)");
    rgrad.addColorStop(1, "transparent");
    ctx.fillStyle = rgrad;
    ctx.fillRect(rx, 0, 8 + Math.random() * 10, rlen);
  }

  // Giant Bay Number
  ctx.save();
  ctx.font = "900 160px 'Impact', sans-serif";
  ctx.fillStyle = "rgba(245, 158, 11, 0.18)";
  ctx.textAlign = "center";
  ctx.fillText(side === "left" ? "0 1" : "0 2", 1024, 320);

  // Bay Title Box
  ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
  ctx.lineWidth = 4;
  ctx.strokeRect(324, 380, 1400, 110);
  ctx.fillStyle = "rgba(245, 158, 11, 0.1)";
  ctx.fillRect(324, 380, 1400, 110);

  ctx.font = "900 44px 'Impact', sans-serif";
  ctx.fillStyle = "rgba(255, 215, 80, 0.9)";
  ctx.fillText(
    side === "left"
      ? "BAY 01 : SMELTING & CRUCIBLES"
      : "BAY 02 : HEAVY ORDNANCE ASSEMBLY",
    1024,
    425
  );

  ctx.font = "bold 28px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = "rgba(255, 240, 190, 0.85)";
  ctx.fillText(
    side === "left"
      ? "உருக்காலை பிரிவு · அதீத வெப்ப மண்டலம்"
      : "தயாரிப்பு பிரிவு · பாதுகாப்பு வளையம்",
    1024,
    465
  );

  // Tamil War Cry / Cultural Slogan
  ctx.font = "900 68px 'Mukta Malar', 'Noto Sans Tamil', sans-serif";
  ctx.fillStyle = side === "left" ? "rgba(255, 75, 75, 0.85)" : "rgba(255, 205, 55, 0.85)";
  ctx.fillText(
    side === "left" ? "நெருப்புடா! · NERUPPU DA" : "சிங்கம் களம் இறங்கிருச்சு!",
    1024,
    620
  );

  ctx.font = "bold 32px 'Arial Black', sans-serif";
  ctx.fillStyle = "rgba(220, 190, 130, 0.75)";
  ctx.fillText(
    side === "left" ? "HIGH HEAT FORGE ZONE" : "THE LION HAS ENTERED THE FIELD",
    1024,
    680
  );

  // Bottom hazard chevron strip
  const bHazY = 940;
  const bStripeW = 40;
  for (let x = 0; x < 2048; x += bStripeW * 2) {
    ctx.fillStyle = "rgba(245, 158, 11, 0.5)";
    ctx.beginPath();
    ctx.moveTo(x, bHazY);
    ctx.lineTo(x + bStripeW, bHazY);
    ctx.lineTo(x + bStripeW * 2, 1024);
    ctx.lineTo(x + bStripeW, 1024);
    ctx.closePath();
    ctx.fill();
  }

  // Soft edge vignette falloff to dissolve side wall edges into darkness
  const sideGrad = ctx.createLinearGradient(0, 0, 2048, 0);
  sideGrad.addColorStop(0, "rgba(8, 6, 8, 0.95)");
  sideGrad.addColorStop(0.25, "transparent");
  sideGrad.addColorStop(0.75, "transparent");
  sideGrad.addColorStop(1, "rgba(8, 6, 8, 0.95)");
  ctx.fillStyle = sideGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  const topBottomGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  topBottomGrad.addColorStop(0, "rgba(8, 6, 8, 0.95)");
  topBottomGrad.addColorStop(0.2, "transparent");
  topBottomGrad.addColorStop(0.8, "transparent");
  topBottomGrad.addColorStop(1, "rgba(8, 6, 8, 0.95)");
  ctx.fillStyle = topBottomGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  return texture;
}

function createFloorTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Weathered factory floor slab
  ctx.fillStyle = "#111014";
  ctx.fillRect(0, 0, 1024, 1024);

  // Large expansion joints (grid)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.strokeRect(512, 0, 512, 512);
  ctx.strokeRect(0, 512, 512, 512);
  ctx.strokeRect(512, 512, 512, 512);

  // Concrete speckling & oil stains
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const val = 15 + Math.floor(Math.random() * 25);
    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Dark oil puddles
  for (let i = 0; i < 15; i++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    const r = 20 + Math.random() * 70;
    const pgrad = ctx.createRadialGradient(px, py, 5, px, py, r);
    pgrad.addColorStop(0, "rgba(5, 4, 6, 0.8)");
    pgrad.addColorStop(0.7, "rgba(10, 8, 12, 0.4)");
    pgrad.addColorStop(1, "transparent");
    ctx.fillStyle = pgrad;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

function createCrateTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Wood planks base
  ctx.fillStyle = "#3a2a1a";
  ctx.fillRect(0, 0, 512, 512);

  // Planks
  const plankH = 512 / 6;
  ctx.strokeStyle = "#1a120b";
  ctx.lineWidth = 4;
  for (let i = 0; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * plankH);
    ctx.lineTo(512, i * plankH);
    ctx.stroke();
  }

  // Diagonal cross brace frame
  ctx.strokeStyle = "rgba(45, 30, 18, 0.9)";
  ctx.lineWidth = 28;
  ctx.strokeRect(14, 14, 484, 484);
  ctx.beginPath();
  ctx.moveTo(28, 28);
  ctx.lineTo(484, 484);
  ctx.stroke();

  // Stencil text
  ctx.save();
  ctx.fillStyle = "rgba(220, 190, 130, 0.75)";
  ctx.font = "bold 28px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("LEO DASS CO.", 256, 230);
  ctx.font = "bold 18px 'Courier New', monospace";
  ctx.fillText("ORDNANCE LOT #07", 256, 270);
  ctx.fillText("COLUMBUS · 2026", 256, 300);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ---------------------------------------------------------------------------
// 3D Architectural Props
// ---------------------------------------------------------------------------

// Elevated Steel Catwalk with Safety Handrail & Stanchions
function IndustrialCatwalk({
  position,
  width = 36,
}: {
  position: [number, number, number];
  width?: number;
}) {
  return (
    <group position={position}>
      {/* Heavy Steel Floor Grating Plate */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[width, 0.22, 1.6]} />
        <meshStandardMaterial color="#222026" roughness={0.35} metalness={0.9} />
      </mesh>

      {/* Outer Kick-Plate Railing */}
      <mesh position={[0, 0.22, 0.78]}>
        <boxGeometry args={[width, 0.28, 0.05]} />
        <meshStandardMaterial color="#35303a" roughness={0.4} metalness={0.85} />
      </mesh>

      {/* Top Handrail Pipe */}
      <mesh position={[0, 1.25, 0.78]}>
        <cylinderGeometry args={[0.035, 0.035, width, 16]} />
        <meshStandardMaterial color="#e5a93b" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Mid Knee-Rail Pipe */}
      <mesh position={[0, 0.72, 0.78]}>
        <cylinderGeometry args={[0.025, 0.025, width, 16]} />
        <meshStandardMaterial color="#888290" roughness={0.4} metalness={0.85} />
      </mesh>

      {/* Vertical Stanchion Posts every 2.4 meters */}
      {[-16, -13.6, -11.2, -8.8, -6.4, -4, -1.6, 1.6, 4, 6.4, 8.8, 11.2, 13.6, 16].map(
        (x, i) => (
          <mesh key={i} position={[x, 0.62, 0.78]}>
            <boxGeometry args={[0.06, 1.25, 0.06]} />
            <meshStandardMaterial color="#2d2a32" roughness={0.4} metalness={0.9} />
          </mesh>
        )
      )}

      {/* Structural Support Cantilever Brackets under Catwalk */}
      {[-14, -7, 0, 7, 14].map((x, i) => (
        <group key={i} position={[x, -0.6, 0]}>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.2, 0.12, 0.12]} />
            <meshStandardMaterial color="#1a1820" roughness={0.5} metalness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Galvanized HVAC Ventilation Ducts running across the ceiling/wall
function IndustrialHVACDuct({
  position,
  width = 36,
  radius = 0.5,
}: {
  position: [number, number, number];
  width?: number;
  radius?: number;
}) {
  return (
    <group position={position}>
      {/* Main Longitudinal Galvanized Tube */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, width, 32]} />
        <meshStandardMaterial color="#686b75" roughness={0.3} metalness={0.88} />
      </mesh>

      {/* Flange Collar Joint Rings every 3.5m */}
      {[-15, -11.5, -8, -4.5, -1, 2.5, 6, 9.5, 13].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius * 1.08, radius * 1.08, 0.16, 32]} />
          <meshStandardMaterial color="#2d2f36" roughness={0.35} metalness={0.95} />
        </mesh>
      ))}

      {/* Vertical Exhaust Dropper Elbows */}
      {[-9, 9].map((x, i) => (
        <group key={i} position={[x, -1.2, 0]}>
          <mesh>
            <cylinderGeometry args={[radius * 0.7, radius * 0.7, 2.4, 24]} />
            <meshStandardMaterial color="#555860" roughness={0.35} metalness={0.85} />
          </mesh>
          {/* Intake Vent Grille at bottom */}
          <mesh position={[0, -1.25, 0]}>
            <cylinderGeometry args={[radius * 0.85, radius * 0.85, 0.1, 24]} />
            <meshStandardMaterial color="#1f2024" roughness={0.6} metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Multi-Gauge Steam & Hydraulic Pipes with Cast Iron Wheel Valves & Gauges
function IndustrialPipeRun({
  position,
  width = 36,
}: {
  position: [number, number, number];
  width?: number;
}) {
  return (
    <group position={position}>
      {/* Pipe 1: Aged Copper High-Pressure Steam Pipe */}
      <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, width, 24]} />
        <meshStandardMaterial color="#9e4c1e" roughness={0.25} metalness={0.92} />
      </mesh>

      {/* Pipe 2: Safety Amber Fuel Conduit */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, width, 24]} />
        <meshStandardMaterial color="#e5a93b" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* Pipe 3: Heavy Oxidized Steel Hydraulic Line */}
      <mesh position={[0, -0.32, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, width, 24]} />
        <meshStandardMaterial color="#2d2d34" roughness={0.3} metalness={0.95} />
      </mesh>

      {/* Cast Iron Red Valves & Pressure Gauges at Key Service Points */}
      {[-8, -2, 4, 10].map((x, i) => (
        <group key={i} position={[x, 0.35, 0.14]}>
          {/* Stem */}
          <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.24, 12]} />
            <meshStandardMaterial color="#333" metalness={0.9} />
          </mesh>
          {/* Red Cast-Iron Valve Wheel */}
          <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.025, 12, 24]} />
            <meshStandardMaterial color="#dc2626" roughness={0.35} metalness={0.8} />
          </mesh>
          {/* Circular Brass Pressure Gauge */}
          <mesh position={[0.4, 0.18, 0.08]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 24]} />
            <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Wall-Mounted Industrial Bulkhead Cage Lamp
function WallBulkheadLamp({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Back Mount Plate */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[0.3, 0.45, 0.08]} />
        <meshStandardMaterial color="#222" metalness={0.9} />
      </mesh>
      {/* Glowing Amber Glass Diffuser */}
      <mesh position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.09, 0.09, 0.28, 16]} />
        <meshBasicMaterial color="#FFB84D" />
      </mesh>
      {/* Protective Wire Cage Rings */}
      <mesh position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.11, 0.11, 0.3, 8, 1, true]} />
        <meshStandardMaterial color="#111" wireframe metalness={0.95} />
      </mesh>
      {/* Warm Ambient Pool on Wall */}
      <pointLight color="#FF9922" intensity={1.8} distance={6.0} decay={2.0} position={[0, 0, 0.2]} />
    </group>
  );
}

// Industrial Steel Access Ladder
function IndustrialLadder({
  position,
  height = 11.2,
}: {
  position: [number, number, number];
  height?: number;
}) {
  return (
    <group position={position}>
      {/* Left Stringer */}
      <mesh position={[-0.24, height / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, height, 12]} />
        <meshStandardMaterial color="#2e2b34" metalness={0.9} roughness={0.4} />
      </mesh>
      {/* Right Stringer */}
      <mesh position={[0.24, height / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, height, 12]} />
        <meshStandardMaterial color="#2e2b34" metalness={0.9} roughness={0.4} />
      </mesh>
      {/* Rungs every 0.35m */}
      {Array.from({ length: Math.floor(height / 0.35) }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.35 + 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.46, 8]} />
          <meshStandardMaterial color="#888" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

// Heavy Industrial Electrical Breaker Cabinet with glowing LEDs
function IndustrialBreakerCabinet({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Heavy Steel Cabinet Box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 1.9, 0.38]} />
        <meshStandardMaterial color="#282a32" roughness={0.45} metalness={0.85} />
      </mesh>
      {/* Door Inset Plate */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[1.15, 1.75, 0.04]} />
        <meshStandardMaterial color="#1e2026" roughness={0.5} metalness={0.9} />
      </mesh>
      {/* Red Rotary Isolation Switch */}
      <mesh position={[0.42, 0, 0.24]}>
        <boxGeometry args={[0.09, 0.28, 0.08]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* High Voltage Hazard Badge */}
      <mesh position={[0, 0.48, 0.23]}>
        <boxGeometry args={[0.55, 0.3, 0.02]} />
        <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* 4 Status Indicator LED diodes */}
      <mesh position={[-0.38, 0.68, 0.23]}>
        <sphereGeometry args={[0.038, 12, 12]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <mesh position={[-0.22, 0.68, 0.23]}>
        <sphereGeometry args={[0.038, 12, 12]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <mesh position={[-0.06, 0.68, 0.23]}>
        <sphereGeometry args={[0.038, 12, 12]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
      <mesh position={[0.1, 0.68, 0.23]}>
        <sphereGeometry args={[0.038, 12, 12]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* Subtle indicator glow light */}
      <pointLight color="#22c55e" intensity={0.8} distance={2.5} decay={2} position={[-0.2, 0.68, 0.38]} />

      {/* Vertical Electrical Conduit Pipe going to ceiling */}
      <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 3.2, 12]} />
        <meshStandardMaterial color="#555" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Wall-Mounted Emergency Fire & Safety Station
function IndustrialFireStation({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Steel Backing Board */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.3, 1.6, 0.06]} />
        <meshStandardMaterial color="#1a1c20" roughness={0.6} metalness={0.8} />
      </mesh>
      {/* Red Fire Extinguisher Tank */}
      <group position={[-0.3, 0, 0.22]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.95, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.25} metalness={0.7} />
        </mesh>
        {/* Dome top */}
        <mesh position={[0, 0.48, 0]}>
          <sphereGeometry args={[0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#dc2626" roughness={0.25} metalness={0.7} />
        </mesh>
        {/* Brass Valve & Gauge */}
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.16, 12]} />
          <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>
      {/* Yellow Fire Axe hanging in bracket */}
      <group position={[0.3, 0, 0.16]} rotation={[0, 0, 0.2]}>
        <mesh>
          <cylinderGeometry args={[0.026, 0.032, 1.15, 12]} />
          <meshStandardMaterial color="#eab308" roughness={0.5} />
        </mesh>
        <mesh position={[0.1, 0.46, 0]}>
          <boxGeometry args={[0.26, 0.18, 0.03]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

// Overhead Heavy Industrial Crane Hoist Trolley
function OverheadCraneHoist({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Trolley Carriage Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 0.48, 1.2]} />
        <meshStandardMaterial color="#eab308" roughness={0.35} metalness={0.8} />
      </mesh>
      {/* Motorized Cable Winch Drum */}
      <mesh position={[0, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 1.0, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.9} />
      </mesh>
      {/* Steel Wire Rope Dropping Down */}
      <mesh position={[0, -1.9, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 2.8, 8]} />
        <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.95} />
      </mesh>
      {/* Forged Industrial Lifting Hook */}
      <group position={[0, -3.4, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.26, 0.26, 0.16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        <mesh position={[0, -0.26, 0]} rotation={[0, 0, Math.PI / 3]}>
          <torusGeometry args={[0.24, 0.055, 12, 24, Math.PI * 1.5]} />
          <meshStandardMaterial color="#2d2d35" roughness={0.25} metalness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

// Floor Safety Perimeter Ring around central rotating platform
function FloorHazardRing({ radius = 4.2 }: { radius?: number }) {
  return (
    <group position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.14, radius, 64]} />
      <meshBasicMaterial color="#eab308" transparent opacity={0.65} />
    </group>
  );
}

// Sledgehammer (Vijay's signature weapon)
function Sledgehammer({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wooden handle with tape grip */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 1.8, 16]} />
        <meshStandardMaterial color="#4a2e18" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Blackened grip tape wrap */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.6, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Heavy Steel Sledge Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.42, 0.26, 0.26]} />
        <meshStandardMaterial color="#2d2d32" roughness={0.35} metalness={0.9} />
      </mesh>
      {/* Beveled strike faces */}
      <mesh position={[0.22, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 16]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.25} metalness={0.95} />
      </mesh>
      <mesh position={[-0.22, 1.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 16]} />
        <meshStandardMaterial color="#3a3a40" roughness={0.25} metalness={0.95} />
      </mesh>
    </group>
  );
}

// Curved Aruval / Machete Blade
function Machete({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wooden grip handle */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.04, 0.5, 16]} />
        <meshStandardMaterial color="#2c1a0e" roughness={0.65} metalness={0.1} />
      </mesh>
      {/* Brass bolster ring */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.05, 16]} />
        <meshStandardMaterial color="#c59b27" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Heavy curved steel blade */}
      <mesh position={[0.06, 1.15, 0]} castShadow>
        <boxGeometry args={[0.12, 1.2, 0.018]} />
        <meshStandardMaterial color="#d4d4dc" roughness={0.2} metalness={0.96} />
      </mesh>
      {/* Sickle curved tip */}
      <mesh position={[0.12, 1.75, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <boxGeometry args={[0.11, 0.35, 0.018]} />
        <meshStandardMaterial color="#d4d4dc" roughness={0.2} metalness={0.96} />
      </mesh>
    </group>
  );
}

// 55-Gallon Steel Oil Barrel
function OilBarrel({
  position,
  rotation = [0, 0, 0],
  color = "#203a43",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.48, 1.7, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Reinforcing structural barrel rings */}
      <mesh position={[0, 0.45, 0]}>
        <torusGeometry args={[0.485, 0.02, 12, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <torusGeometry args={[0.485, 0.02, 12, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.8} />
      </mesh>
    </group>
  );
}

// Slatted Military Ordnance Crate
function WoodCrate({
  position,
  rotation = [0, 0, 0],
  texture,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  texture: THREE.CanvasTexture | null;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[1.3, 1.1, 1.3]} />
      <meshStandardMaterial
        color="#ffffff"
        map={texture || undefined}
        roughness={0.75}
        metalness={0.1}
      />
    </mesh>
  );
}

// Hanging Industrial Steel Chain with Hook
function HangingChain({
  position,
  length = 6,
}: {
  position: [number, number, number];
  length?: number;
}) {
  return (
    <group position={position}>
      {/* Vertical chain rod representation */}
      <mesh position={[0, -length / 2, 0]}>
        <cylinderGeometry args={[0.035, 0.035, length, 12]} />
        <meshStandardMaterial color="#404048" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Forged steel hook at bottom */}
      <mesh position={[0, -length - 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.15, 0.035, 12, 24, Math.PI * 1.4]} />
        <meshStandardMaterial color="#2d2d35" roughness={0.25} metalness={0.95} />
      </mesh>
    </group>
  );
}

// Industrial Steel I-Beam Column
function IBeamColumn({
  position,
  height = 18,
}: {
  position: [number, number, number];
  height?: number;
}) {
  return (
    <group position={position}>
      {/* Web */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.08, height, 0.5]} />
        <meshStandardMaterial color="#252428" roughness={0.5} metalness={0.85} />
      </mesh>
      {/* Front Flange */}
      <mesh position={[0.2, height / 2, 0]}>
        <boxGeometry args={[0.08, height, 0.12]} />
        <meshStandardMaterial color="#302f35" roughness={0.45} metalness={0.9} />
      </mesh>
      {/* Back Flange */}
      <mesh position={[-0.2, height / 2, 0]}>
        <boxGeometry args={[0.08, height, 0.12]} />
        <meshStandardMaterial color="#302f35" roughness={0.45} metalness={0.9} />
      </mesh>
    </group>
  );
}

// Overhead Industrial Warehouse Pendant Lamp
function IndustrialPendantLamp({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Drop Cord */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 2.4, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Enamel Shade */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.55, 0.35, 24, 1, true]} />
        <meshStandardMaterial color="#1e222d" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Glowing Tungsten Bulb */}
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#FFB84D" />
      </mesh>
      <pointLight color="#FFA834" intensity={1.8} distance={6.5} decay={2.0} position={[0, -0.2, 0]} />
    </group>
  );
}

// Drifting Forge Sparks & Embers
function FactorySparks({ count = 140 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seededRandom(i * 5 + 1) - 0.5) * 16;
      pos[i * 3 + 1] = seededRandom(i * 5 + 2) * 8;
      pos[i * 3 + 2] = (seededRandom(i * 5 + 3) - 0.5) * 14;
      spd[i] = 0.8 + seededRandom(i * 5 + 4) * 1.5;
      ph[i] = seededRandom(i * 5 + 5) * Math.PI * 2;
    }
    return { positions: pos, speeds: spd, phases: ph };
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Rise upward
      array[i * 3 + 1] += speeds[i] * delta;
      // Drift sideways
      array[i * 3] += Math.sin(array[i * 3 + 1] * 2.0 + phases[i]) * 0.015;

      // Loop back to ground when reaching ceiling
      if (array[i * 3 + 1] > 9.0) {
        array[i * 3 + 1] = 0.1;
        array[i * 3] = (Math.random() - 0.5) * 16;
        array[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        color="#FFAA33"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Main LeoFactoryEnvironment Component
// ---------------------------------------------------------------------------

export function LeoFactoryEnvironment() {
  const backWallTexture = useMemo(() => createLeoBackWallTexture(), []);
  const floorTexture = useMemo(() => createFloorTexture(), []);
  const crateTexture = useMemo(() => createCrateTexture(), []);
  const leftWallTexture = useMemo(() => createSideWallTexture("left"), []);
  const rightWallTexture = useMemo(() => createSideWallTexture("right"), []);

  // Dispose procedural canvas textures on unmount to prevent GPU accumulation
  useEffect(() => {
    return () => {
      backWallTexture?.dispose();
      floorTexture?.dispose();
      crateTexture?.dispose();
      leftWallTexture?.dispose();
      rightWallTexture?.dispose();
    };
  }, [backWallTexture, floorTexture, crateTexture, leftWallTexture, rightWallTexture]);

  return (
    <group name="leo-factory-environment">
      {/* 1. Large Factory Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial
          map={floorTexture || undefined}
          color="#161318"
          roughness={0.62}
          metalness={0.25}
        />
      </mesh>

      {/* Safety Floor Hazard Ring around Central Turntable Platform */}
      <FloorHazardRing radius={4.2} />

      {/* 2. Enclosed Back Wall with 4K Detailed Leo Stencil Mural & Factory Signage */}
      <mesh position={[0, 8.5, -12]} receiveShadow>
        <planeGeometry args={[36, 18]} />
        <meshStandardMaterial
          map={backWallTexture || undefined}
          color="#ffffff"
          roughness={0.65}
          metalness={0.25}
        />
      </mesh>

      {/* Structural Vertical I-Beams on Back Wall */}
      <IBeamColumn position={[-14, 0, -11.9]} />
      <IBeamColumn position={[-7, 0, -11.9]} />
      <IBeamColumn position={[7, 0, -11.9]} />
      <IBeamColumn position={[14, 0, -11.9]} />

      {/* 3. Real 3D Physical Architecture Attached to Back Wall */}
      {/* Elevated Industrial Steel Catwalk with Handrails at Y = 11.2m (High overhead gantry) */}
      <IndustrialCatwalk position={[0, 11.2, -11.3]} width={36} />

      {/* Heavy Galvanized Ventilation HVAC Duct at Y = 13.0m */}
      <IndustrialHVACDuct position={[0, 13.0, -11.1]} width={36} radius={0.5} />

      {/* Multi-Gauge Steam & Hydraulic Pipes with Red Valves at Y = 6.2m */}
      <IndustrialPipeRun position={[0, 6.2, -11.6]} width={36} />

      {/* Access Ladders to Catwalk at left and right extremes */}
      <IndustrialLadder position={[-13.5, 0, -11.0]} height={11.2} />
      <IndustrialLadder position={[13.5, 0, -11.0]} height={11.2} />

      {/* Wall Bulkhead Cage Lamps illuminating the wall stencils */}
      <WallBulkheadLamp position={[-12, 11.8, -11.7]} />
      <WallBulkheadLamp position={[12, 11.8, -11.7]} />
      <WallBulkheadLamp position={[-8, 6.5, -11.7]} />
      <WallBulkheadLamp position={[0, 6.5, -11.7]} />
      <WallBulkheadLamp position={[8, 6.5, -11.7]} />

      {/* Wall-Mounted Heavy Electrical Breaker Cabinet with glowing LEDs */}
      <IndustrialBreakerCabinet position={[-7.2, 2.5, -11.8]} />

      {/* Wall-Mounted Emergency Fire & Safety Station */}
      <IndustrialFireStation position={[7.2, 2.5, -11.8]} />

      {/* 4. Left Wall with Bay 01 Stencil Texture, Windows & Amber Flood */}
      <mesh position={[-16, 8.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[32, 18]} />
        <meshStandardMaterial
          map={leftWallTexture || undefined}
          color="#1e1c22"
          roughness={0.92}
          metalness={0.1}
        />
      </mesh>
      {/* Factory Window 1 (Left) */}
      <group position={[-15.8, 5.5, -4]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[5, 4]} />
          <meshBasicMaterial color="#FF9922" transparent opacity={0.12} />
        </mesh>
        <pointLight color="#FF9500" intensity={0.4} distance={4.5} decay={2.2} />
      </group>
      {/* Factory Window 2 (Left) */}
      <group position={[-15.8, 5.5, 4]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[5, 4]} />
          <meshBasicMaterial color="#FF9922" transparent opacity={0.12} />
        </mesh>
        <pointLight color="#FF9500" intensity={0.4} distance={4.5} decay={2.2} />
      </group>

      {/* 5. Right Wall with Bay 02 Stencil Texture */}
      <mesh position={[16, 8.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[32, 18]} />
        <meshStandardMaterial
          map={rightWallTexture || undefined}
          color="#1e1c22"
          roughness={0.92}
          metalness={0.1}
        />
      </mesh>

      {/* 6. Overhead Roof Trusses across Ceiling */}
      {[-8, -2, 4, 10].map((zPos, idx) => (
        <group key={idx} position={[0, 12.5, zPos]}>
          {/* Main Cross Beam */}
          <mesh>
            <boxGeometry args={[34, 0.4, 0.4]} />
            <meshStandardMaterial color="#2a2830" roughness={0.5} metalness={0.85} />
          </mesh>
          {/* Angled Lattice Rafters */}
          <mesh position={[-8, 1.2, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[10, 0.15, 0.15]} />
            <meshStandardMaterial color="#201f25" roughness={0.6} metalness={0.8} />
          </mesh>
          <mesh position={[8, 1.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <boxGeometry args={[10, 0.15, 0.15]} />
            <meshStandardMaterial color="#201f25" roughness={0.6} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Overhead Heavy Crane Hoist Trolley */}
      <OverheadCraneHoist position={[0, 12.3, -2.5]} />

      {/* 7. Hanging Factory Pendant Cage Lamps */}
      <IndustrialPendantLamp position={[-4.5, 7.5, -3.5]} />
      <IndustrialPendantLamp position={[4.5, 7.5, -3.5]} />
      <IndustrialPendantLamp position={[-4.5, 7.5, 3.5]} />
      <IndustrialPendantLamp position={[4.5, 7.5, 3.5]} />

      {/* 8. Hanging Chains from Rafters */}
      <HangingChain position={[-3.8, 12, -3.0]} length={6.5} />
      <HangingChain position={[4.2, 12, -4.5]} length={7.2} />
      <HangingChain position={[5.0, 12, 2.5]} length={5.8} />

      {/* 9. Weapons & Props Flanking the Medallion */}
      {/* Sledgehammer #1: Leaning against barrel cluster on left */}
      <Sledgehammer position={[-3.2, 0, 1.4]} rotation={[0.2, 0.4, 0.22]} />

      {/* Sledgehammer #2: Resting on right crate */}
      <Sledgehammer position={[3.6, 0.65, -0.6]} rotation={[Math.PI / 2, 0, -0.4]} />

      {/* Machete #1: Stuck upright into heavy timber chopping block */}
      <group position={[-2.8, 0, -1.8]}>
        {/* Timber block */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.4, 0.7, 16]} />
          <meshStandardMaterial color="#301f14" roughness={0.85} />
        </mesh>
        {/* Machete embedded in block */}
        <Machete position={[0, 0.3, 0]} rotation={[0.08, 0.2, 0.05]} />
      </group>

      {/* Machete #2: Wall mounted on weapon rack at left wall */}
      <Machete position={[-15.6, 3.5, -1.5]} rotation={[0, Math.PI / 2, Math.PI / 3]} />
      <Machete position={[-15.6, 3.5, 0.5]} rotation={[0, Math.PI / 2, -Math.PI / 3]} />

      {/* Oil Barrels Cluster (Left) */}
      <OilBarrel position={[-4.2, 0, -1.2]} color="#1b3a4b" />
      <OilBarrel position={[-3.7, 0, -2.5]} color="#5a2214" />
      <OilBarrel position={[-4.8, 0, 0.8]} color="#2d3338" />

      {/* Oil Barrels (Right) */}
      <OilBarrel position={[4.5, 0, -1.5]} color="#5a2214" />
      <OilBarrel position={[4.1, 0, -2.8]} color="#1b3a4b" />

      {/* Wooden Ordnance Crates */}
      <WoodCrate position={[3.6, 0.55, -0.8]} texture={crateTexture} />
      <WoodCrate position={[4.8, 0.55, 0.6]} texture={crateTexture} />
      <WoodCrate position={[-4.6, 0.55, 2.2]} rotation={[0, 0.35, 0]} texture={crateTexture} />

      {/* 10. Upward Drifting Naa Ready Forge Sparks & Embers */}
      <FactorySparks count={140} />
    </group>
  );
}
