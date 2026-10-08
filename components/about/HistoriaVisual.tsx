"use client";

import { useEffect, useRef, useState } from "react";

import {
  BarChart3,
  CalendarDays,
  MapPin,
  Sprout,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

/* ============================================================
   LIENZO BASE
============================================================ */

const W = 768;
const H = 512;

/* ============================================================
   TIPOS
============================================================ */

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "blue" | "green";
  className: string;
};

/* ============================================================
   TARJETA DE DATO
============================================================ */

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: StatCardProps) {
  const iconTone =
    tone === "blue"
      ? "bg-primary-50 text-primary-700"
      : "bg-accent-50 text-accent-600";

  return (
    <div
      className={`
        absolute
        z-30
        flex
        items-center
        gap-3
        rounded-[18px]
        border
        border-slate-100/90
        bg-white/95
        px-3.5
        shadow-[0_14px_35px_rgba(15,23,42,0.08)]
        backdrop-blur-sm
        ${className}
      `}
    >
      {/* ICONO */}
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-[14px]
          ${iconTone}
        `}
      >
        <Icon
          className="h-[21px] w-[21px]"
          strokeWidth={1.8}
        />
      </div>

      {/* INFORMACIÓN */}
      <div className="min-w-0">
        <p
          className="
            text-[10.5px]
            font-medium
            leading-[14px]
            text-slate-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-[2px]
            font-display
            text-[15px]
            font-bold
            leading-[19px]
            tracking-[-0.015em]
            text-primary-950
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   HISTORIA VISUAL
============================================================ */

export default function HistoriaVisual() {
  const wrapRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = wrapRef.current;

    if (!element) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;

      setScale(Math.min(1, width / W));
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="
        relative
        mx-auto
        hidden
        w-full
        max-w-[768px]
        lg:block
      "
      style={{
        height: H * scale,
      }}
    >
      {/* =====================================================
          LIENZO 768 × 512
      ====================================================== */}

      <div
        className="
          absolute
          left-0
          top-0
          origin-top-left
        "
        style={{
          width: W,
          height: H,
          transform: `scale(${scale})`,
        }}
      >
        {/* =================================================
            FORMAS DE FONDO
        ================================================== */}

        {/* VERDE PRINCIPAL */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-[188px]
            top-[58px]
            z-0
            h-[345px]
            w-[315px]
            rounded-full
            bg-accent-100/65
          "
        />

        {/* AZUL DERECHO */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-[468px]
            top-[140px]
            z-0
            h-[238px]
            w-[218px]
            rounded-full
            bg-primary-100/70
          "
        />

        {/* AZUL INFERIOR IZQUIERDO */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-[142px]
            top-[250px]
            z-0
            h-[185px]
            w-[185px]
            rounded-full
            bg-primary-100/60
          "
        />

        {/* AZUL SUAVE INFERIOR */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-[420px]
            top-[270px]
            z-0
            h-[165px]
            w-[165px]
            rounded-full
            bg-primary-200/25
          "
        />

        {/* =================================================
            PUNTOS DECORATIVOS
        ================================================== */}

        {/* SUPERIOR DERECHO */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-[680px]
            top-[43px]
            z-10
            grid
            grid-cols-4
            gap-[8px]
            opacity-55
          "
        >
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              key={`top-${index}`}
              className="
                h-[5px]
                w-[5px]
                rounded-full
                bg-primary-300
              "
            />
          ))}
        </div>

        {/* INFERIOR IZQUIERDO */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-[67px]
            top-[300px]
            z-10
            grid
            grid-cols-4
            gap-[8px]
            opacity-50
          "
        >
          {Array.from({ length: 16 }).map((_, index) => (
            <span
              key={`bottom-blue-${index}`}
              className="
                h-[5px]
                w-[5px]
                rounded-full
                bg-primary-300
              "
            />
          ))}
        </div>

        {/* INFERIOR DERECHO */}
        <div
          aria-hidden="true"
          className="
            absolute
            left-[685px]
            top-[315px]
            z-10
            grid
            grid-cols-4
            gap-[8px]
            opacity-55
          "
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={`bottom-green-${index}`}
              className="
                h-[5px]
                w-[5px]
                rounded-full
                bg-accent-400
              "
            />
          ))}
        </div>

        {/* =================================================
            LÍNEAS / ÓRBITAS
        ================================================== */}

        <svg
          aria-hidden="true"
          viewBox={`0 0 ${W} ${H}`}
          fill="none"
          className="
            pointer-events-none
            absolute
            inset-0
            z-[15]
            h-full
            w-full
            overflow-visible
          "
        >
          {/* =============================================
              SUPERIOR IZQUIERDA
              DESDE 2022 → CENTRO
          ============================================== */}

          <path
            d="
              M 232 137
              C 252 145, 258 162, 259 185
              C 260 202, 269 213, 286 218
            "
            stroke="#2878B7"
            strokeWidth="1.8"
            strokeDasharray="7 8"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* =============================================
              SUPERIOR DERECHA
              CENTRO → SUCURSALES
          ============================================== */}

          <path
            d="
              M 482 202
              C 490 166, 505 141, 530 127
              C 548 117, 567 115, 585 120
            "
            stroke="#5DA62A"
            strokeWidth="1.8"
            strokeDasharray="7 8"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* =============================================
              INFERIOR IZQUIERDA
              COMUNIDAD → CENTRO
          ============================================== */}

          <path
            d="
              M 222 389
              C 220 358, 228 337, 248 323
              C 260 315, 273 311, 287 310
            "
            stroke="#2878B7"
            strokeWidth="1.8"
            strokeDasharray="7 8"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* =============================================
              INFERIOR DERECHA
              CENTRO → CRECIMIENTO
          ============================================== */}

          <path
            d="
              M 481 309
              C 489 344, 505 367, 531 382
              C 550 393, 569 395, 588 390
            "
            stroke="#5DA62A"
            strokeWidth="1.8"
            strokeDasharray="7 8"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* =============================================
              NODOS AZULES
          ============================================== */}

          <circle
            cx="232"
            cy="137"
            r="6"
            fill="#2878B7"
            stroke="#FFFFFF"
            strokeWidth="3"
          />

          <circle
            cx="260"
            cy="196"
            r="5"
            fill="#2878B7"
            stroke="#FFFFFF"
            strokeWidth="3"
          />

          <circle
            cx="222"
            cy="389"
            r="6"
            fill="#2878B7"
            stroke="#FFFFFF"
            strokeWidth="3"
          />

          <circle
            cx="252"
            cy="321"
            r="5"
            fill="#2878B7"
            stroke="#FFFFFF"
            strokeWidth="3"
          />

          {/* =============================================
              NODOS VERDES
          ============================================== */}

          <circle
            cx="501"
            cy="151"
            r="5"
            fill="#7ACB3B"
            stroke="#FFFFFF"
            strokeWidth="3"
          />

          <circle
            cx="585"
            cy="120"
            r="6"
            fill="#7ACB3B"
            stroke="#FFFFFF"
            strokeWidth="3"
          />

          <circle
            cx="501"
            cy="357"
            r="5"
            fill="#7ACB3B"
            stroke="#FFFFFF"
            strokeWidth="3"
          />

          <circle
            cx="588"
            cy="390"
            r="6"
            fill="#7ACB3B"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
        </svg>

        {/* =================================================
            TARJETA CENTRAL
        ================================================== */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            z-20
            flex
            h-[205px]
            w-[240px]
            -translate-x-1/2
            -translate-y-1/2
            flex-col
            items-center
            rounded-[28px]
            border
            border-white/90
            bg-white/95
            px-5
            py-5
            text-center
            shadow-[0_24px_60px_rgba(15,55,109,0.12)]
            backdrop-blur-xl
          "
        >
          {/* ICONO */}
          <div
            className="
              flex
              h-[54px]
              w-[54px]
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-accent-50
              text-accent-600
            "
          >
            <Sprout
              className="h-7 w-7"
              strokeWidth={1.8}
            />
          </div>

          {/* TÍTULO */}
          <h3
            className="
              mt-3
              font-display
              text-[19px]
              font-bold
              leading-[24px]
              tracking-[-0.025em]
              text-primary-950
            "
          >
            Crecemos cerca de ti
          </h3>

          {/* TEXTO */}
          <p
            className="
              mt-2
              max-w-[205px]
              text-[11.5px]
              font-normal
              leading-[17px]
              text-slate-500
            "
          >
            Gracias a la confianza de nuestros pacientes, seguimos
            creciendo en la Ribera de Chapala.
          </p>

          {/* DETALLE VERDE */}
          <div
            className="
              mt-auto
              h-[4px]
              w-9
              rounded-full
              bg-accent-500
            "
          />
        </div>

        {/* =================================================
            TARJETA — DESDE 2022
        ================================================== */}

        <StatCard
          icon={CalendarDays}
          label="Nuestro inicio"
          value="Desde 2022"
          tone="blue"
          className="
            left-[54px]
            top-[94px]
            h-[72px]
            w-[190px]
          "
        />

        {/* =================================================
            TARJETA — SUCURSALES
        ================================================== */}

        <StatCard
          icon={MapPin}
          label="Presencia"
          value="4 sucursales"
          tone="green"
          className="
            left-[528px]
            top-[92px]
            h-[72px]
            w-[190px]
          "
        />

        {/* =================================================
            TARJETA — COMUNIDAD
        ================================================== */}

        <StatCard
          icon={Users}
          label="Comunidad"
          value="Ribera de Chapala"
          tone="blue"
          className="
            left-[42px]
            top-[374px]
            h-[74px]
            w-[225px]
          "
        />

        {/* =================================================
            TARJETA — CRECIMIENTO
        ================================================== */}

        <StatCard
          icon={BarChart3}
          label="Seguimos creciendo"
          value="Más cerca de nuestra comunidad"
          tone="green"
          className="
            left-[510px]
            top-[372px]
            h-[78px]
            w-[225px]
            [&_p:last-child]:max-w-[145px]
            [&_p:last-child]:text-[13px]
            [&_p:last-child]:leading-[17px]
          "
        />
      </div>
    </div>
  );
}