import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "public", "assets", "hero");
const outFile = path.join(outDir, "tuagendaweb-hero-barberias.png");

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1120 }, deviceScaleFactor: 1 });

await page.setContent(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1600px;
      height: 1120px;
      display: grid;
      place-items: center;
      background: #f7f4ee;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #123D3A;
    }
    .stage {
      position: relative;
      width: 1500px;
      height: 1040px;
      overflow: hidden;
      border-radius: 56px;
      background:
        linear-gradient(90deg, rgba(18,61,58,.06) 1px, transparent 1px),
        linear-gradient(0deg, rgba(18,61,58,.06) 1px, transparent 1px),
        radial-gradient(circle at 20% 12%, rgba(231,184,90,.38), transparent 30%),
        radial-gradient(circle at 82% 20%, rgba(142,190,174,.36), transparent 32%),
        linear-gradient(135deg, #fbf8f1, #eef3ea 58%, #f7f4ee);
      background-size: 64px 64px, 64px 64px, auto, auto, auto;
      box-shadow: 0 34px 90px rgba(18,61,58,.16);
    }
    .photo {
      position: absolute;
      right: 68px;
      top: 72px;
      width: 620px;
      height: 720px;
      overflow: hidden;
      border: 16px solid #123D3A;
      border-radius: 52px;
      background:
        radial-gradient(circle at 54% 34%, rgba(255,213,128,.95) 0 6%, transparent 7%),
        radial-gradient(ellipse at 54% 40%, #d39b62 0 14%, transparent 15%),
        radial-gradient(ellipse at 55% 44%, #8a5634 0 23%, transparent 24%),
        radial-gradient(ellipse at 47% 42%, #f5c08a 0 15%, transparent 16%),
        linear-gradient(125deg, #080d11 0 19%, #17120e 20% 30%, #be8246 31% 62%, #0d1215 63% 100%);
      box-shadow: 0 34px 74px rgba(18,61,58,.28);
    }
    .photo:before {
      content: "";
      position: absolute;
      left: 28px;
      top: 92px;
      width: 530px;
      height: 132px;
      border-radius: 80px;
      transform: rotate(-18deg);
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.78) 42%, rgba(32,34,35,.98) 44% 62%, rgba(255,255,255,.9) 63%, transparent);
      opacity: .8;
    }
    .photo:after {
      content: "";
      position: absolute;
      left: -62px;
      top: 144px;
      width: 420px;
      height: 190px;
      border-radius: 80px;
      transform: rotate(22deg);
      background: #05080a;
      filter: drop-shadow(260px 138px 0 #05080a);
      opacity: .95;
    }
    .browser {
      position: absolute;
      left: 120px;
      top: 145px;
      width: 740px;
      height: 510px;
      border-radius: 30px;
      background: rgba(255,255,255,.86);
      border: 1px solid rgba(18,61,58,.13);
      box-shadow: 0 32px 80px rgba(18,61,58,.15);
      backdrop-filter: blur(18px);
      overflow: hidden;
    }
    .browserbar {
      height: 58px;
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 0 28px;
      background: #123D3A;
    }
    .dot { width: 13px; height: 13px; border-radius: 50%; background: #E7B85A; }
    .dot:nth-child(2) { background: #e7e0cf; }
    .dot:nth-child(3) { background: #8fb9aa; }
    .browser main { padding: 42px 44px; }
    .kicker {
      width: max-content;
      border-radius: 999px;
      padding: 10px 18px;
      background: rgba(231,184,90,.32);
      font-weight: 900;
      letter-spacing: .14em;
      font-size: 18px;
    }
    .headline {
      margin-top: 28px;
      max-width: 560px;
      font-size: 58px;
      line-height: .94;
      letter-spacing: -1px;
      font-weight: 950;
    }
    .sub {
      margin-top: 26px;
      max-width: 520px;
      color: rgba(30,30,28,.62);
      font-size: 22px;
      line-height: 1.45;
      font-weight: 700;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 34px;
    }
    .stat {
      min-height: 116px;
      border: 1px solid rgba(18,61,58,.11);
      border-radius: 24px;
      background: #fbfaf6;
      padding: 20px;
    }
    .stat b { display: block; font-size: 34px; }
    .stat span { display: block; margin-top: 8px; color: rgba(30,30,28,.58); font-size: 15px; font-weight: 800; }
    .phone {
      position: absolute;
      right: 470px;
      bottom: 80px;
      width: 300px;
      height: 606px;
      border: 14px solid #123D3A;
      border-radius: 48px;
      background: #f7f4ee;
      box-shadow: 0 30px 82px rgba(18,61,58,.24);
      overflow: hidden;
    }
    .speaker {
      width: 84px;
      height: 8px;
      border-radius: 999px;
      margin: 18px auto 0;
      background: rgba(18,61,58,.25);
    }
    .phone-content { padding: 22px; }
    .brandline { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 900; }
    .mini-logo { width: 34px; height: 34px; border-radius: 12px; background: #E7B85A; display: grid; place-items: center; color: #123D3A; }
    .step {
      margin-top: 18px;
      border-radius: 22px;
      background: white;
      border: 1px solid rgba(18,61,58,.1);
      padding: 18px;
      font-weight: 900;
      box-shadow: 0 10px 26px rgba(18,61,58,.08);
    }
    .step small { display:block; margin-top: 7px; color: rgba(30,30,28,.52); font-size: 13px; }
    .confirm {
      margin-top: 20px;
      border-radius: 24px;
      padding: 20px;
      background: #123D3A;
      color: white;
      font-weight: 950;
      font-size: 20px;
    }
    .confirm span { display:block; color: #E7B85A; font-size: 13px; margin-bottom: 8px; letter-spacing: .12em; }
    .badge {
      position: absolute;
      left: 150px;
      bottom: 112px;
      display: flex;
      align-items: center;
      gap: 18px;
      border-radius: 28px;
      background: #123D3A;
      color: white;
      padding: 22px 28px;
      box-shadow: 0 22px 55px rgba(18,61,58,.22);
      font-size: 19px;
      font-weight: 900;
    }
    .badge i {
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      border-radius: 18px;
      background: #E7B85A;
      color: #123D3A;
      font-style: normal;
      font-size: 28px;
    }
    .pill {
      position: absolute;
      right: 96px;
      bottom: 116px;
      border-radius: 999px;
      background: #E7B85A;
      color: #123D3A;
      padding: 18px 28px;
      font-size: 19px;
      font-weight: 950;
      box-shadow: 0 18px 42px rgba(18,61,58,.15);
    }
  </style>
</head>
<body>
  <div class="stage" id="capture">
    <div class="browser">
      <div class="browserbar"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      <main>
        <div class="kicker">AGENDA FULL</div>
        <div class="headline">Turnos online para negocios reales</div>
        <div class="sub">Link de reserva, panel simple y WhatsApp como canal de venta.</div>
        <div class="stats">
          <div class="stat"><b>18</b><span>turnos de hoy</span></div>
          <div class="stat"><b>12</b><span>servicios activos</span></div>
          <div class="stat"><b>4</b><span>profesionales</span></div>
        </div>
      </main>
    </div>
    <div class="photo"></div>
    <div class="phone">
      <div class="speaker"></div>
      <div class="phone-content">
        <div class="brandline"><span class="mini-logo">✓</span> Matias Barber</div>
        <div class="step">Corte + barba <small>45 min · $8.000</small></div>
        <div class="step">Sasha <small>Profesional disponible</small></div>
        <div class="step">Martes 15:00 <small>Horario libre</small></div>
        <div class="confirm"><span>TURNO CONFIRMADO</span>Reserva lista desde el celular</div>
      </div>
    </div>
    <div class="badge"><i>↗</i><span>Menos mensajes<br/>repetidos</span></div>
    <div class="pill">Ideal para barberías</div>
  </div>
</body>
</html>`);

await page.locator("#capture").screenshot({ path: outFile });
await browser.close();

console.log(outFile);
