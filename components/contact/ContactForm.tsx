
"use client";

import { FormEvent, useState } from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";

/* ============================================================
   TIPOS
============================================================ */

type FormStatus = "idle" | "success" | "error";

type ContactPayload = {
  name: string;
  contact: string;
  subject: string;
  message: string;
};

/* ============================================================
   CONFIGURACIÓN
============================================================ */

// Endpoint que implementará el backend.
const CONTACT_ENDPOINT = "/api/contact";

/* ============================================================
   ESTILOS
============================================================ */

const inputClassName = `
  w-full
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4
  text-sm
  text-slate-700
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-primary-400
  focus:ring-4
  focus:ring-primary-100/60
  disabled:cursor-not-allowed
  disabled:bg-slate-50
  disabled:opacity-70
`;

/* ============================================================
   COMPONENTE
============================================================ */

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<FormStatus>("idle");

  const [feedback, setFeedback] = useState("");

  /* ==========================================================
     ENVÍO DEL FORMULARIO
  ========================================================== */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload: ContactPayload = {
      name: String(formData.get("name") ?? "").trim(),
      contact: String(formData.get("contact") ?? "").trim(),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? "").trim(),
    };

    /* ========================================================
       VALIDACIONES DEL FRONTEND
    ======================================================== */

    if (payload.name.length < 2) {
      setStatus("error");
      setFeedback("Ingresa tu nombre completo.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneRegex = /^\+?[\d\s().-]{10,20}$/;

    if (
      !emailRegex.test(payload.contact) &&
      !phoneRegex.test(payload.contact)
    ) {
      setStatus("error");

      setFeedback(
        "Ingresa un correo electrónico o teléfono válido."
      );

      return;
    }

    if (!payload.subject) {
      setStatus("error");
      setFeedback("Selecciona un motivo de contacto.");
      return;
    }

    if (payload.message.length < 10) {
      setStatus("error");

      setFeedback(
        "Tu mensaje debe contener al menos 10 caracteres."
      );

      return;
    }

    /* ========================================================
       PETICIÓN AL BACKEND
    ======================================================== */

    setLoading(true);
    setStatus("idle");
    setFeedback("");

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.success !== true) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "No fue posible enviar el mensaje. Inténtalo nuevamente."
        );
      }

      /* ======================================================
         ENVÍO EXITOSO
      ====================================================== */

      setStatus("success");

      setFeedback(
        "¡Tu mensaje fue enviado correctamente! Nos pondremos en contacto contigo."
      );

      form.reset();
    } catch (error) {
      /* ======================================================
         ERROR DE ENVÍO
      ====================================================== */

      setStatus("error");

      setFeedback(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al enviar tu mensaje."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     INTERFAZ
  ========================================================== */

  return (
    <div>
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent-600">
        Escríbenos
      </p>

      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary-950 sm:text-[28px]">
        Envíanos un mensaje
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Déjanos tus datos y cuéntanos cómo podemos ayudarte.
      </p>

      {/* =====================================================
          FORMULARIO
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
        {/* ===================================================
            NOMBRE Y CONTACTO
        ==================================================== */}

        <div className="grid gap-5 sm:grid-cols-2">
          {/* NOMBRE */}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-xs font-bold text-primary-950"
            >
              Nombre completo
              <span className="ml-1 text-accent-600">
                *
              </span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              placeholder="Tu nombre"
              disabled={loading}
              className={`h-12 ${inputClassName}`}
            />
          </div>

          {/* CONTACTO */}

          <div>
            <label
              htmlFor="contact"
              className="mb-2 block text-xs font-bold text-primary-950"
            >
              Correo o teléfono
              <span className="ml-1 text-accent-600">
                *
              </span>
            </label>

            <input
              id="contact"
              name="contact"
              type="text"
              required
              maxLength={150}
              placeholder="Tu medio de contacto"
              disabled={loading}
              className={`h-12 ${inputClassName}`}
            />
          </div>
        </div>

        {/* ===================================================
            MOTIVO DE CONTACTO
        ==================================================== */}

        <div>
          <label
            htmlFor="subject"
            className="mb-2 block text-xs font-bold text-primary-950"
          >
            Motivo de contacto
            <span className="ml-1 text-accent-600">
              *
            </span>
          </label>

          <select
            id="subject"
            name="subject"
            required
            defaultValue=""
            disabled={loading}
            className={`h-12 ${inputClassName}`}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>

            <option value="estudios">
              Información sobre estudios
            </option>

            <option value="cita">
              Información sobre una cita
            </option>

            <option value="sucursal">
              Información sobre sucursales
            </option>

            <option value="otro">
              Otro
            </option>
          </select>
        </div>

        {/* ===================================================
            MENSAJE
        ==================================================== */}

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-xs font-bold text-primary-950"
          >
            Mensaje
            <span className="ml-1 text-accent-600">
              *
            </span>
          </label>

          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            maxLength={3000}
            rows={5}
            placeholder="Escribe aquí tu duda o mensaje..."
            disabled={loading}
            className={`resize-none py-3 leading-6 ${inputClassName}`}
          />
        </div>

        {/* ===================================================
            BOTÓN Y MENSAJES
        ==================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* BOTÓN */}

          <button
            type="submit"
            disabled={loading}
            className="
              group
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-primary-900
              px-6
              text-sm
              font-bold
              text-white
              shadow-[0_8px_22px_rgba(11,55,109,0.14)]
              transition-all
              hover:-translate-y-0.5
              hover:bg-primary-800
              disabled:cursor-not-allowed
              disabled:opacity-65
              disabled:hover:translate-y-0
            "
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />

                Enviando mensaje...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />

                Enviar mensaje

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </>
            )}
          </button>

          {/* MENSAJE DE RESULTADO */}

          {status !== "idle" && (
            <div
              role={
                status === "error"
                  ? "alert"
                  : "status"
              }
              aria-live="polite"
              className={`
                flex
                items-start
                gap-2
                text-xs
                font-semibold
                leading-5
                ${
                  status === "success"
                    ? "text-accent-700"
                    : "text-red-600"
                }
              `}
            >
              {status === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}

              <span>{feedback}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
