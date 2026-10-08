'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';

import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from 'react-leaflet';

import type { Branch } from '@/types/branch';

type BranchesMapProps = {
  branches: Branch[];
  selectedBranch: Branch | null;
  onSelectBranch: (branch: Branch) => void;
};

/* ============================================================
   ICONO DE UBICACIÓN
============================================================ */

const createBranchIcon = (selected: boolean) =>
  L.divIcon({
    className: 'labwork-marker-wrapper',

    html: `
      <div
        class="
          labwork-location-pin
          ${selected ? 'labwork-location-pin-selected' : ''}
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M20 10C20 15 12 22 12 22C12 22 4 15 4 10C4 5.58 7.58 2 12 2C16.42 2 20 5.58 20 10Z"
            fill="currentColor"
          />

          <circle
            cx="12"
            cy="10"
            r="3"
            fill="white"
          />
        </svg>
      </div>
    `,

    iconSize: selected
      ? [44, 50]
      : [36, 42],

    iconAnchor: selected
      ? [22, 50]
      : [18, 42],

    tooltipAnchor: [
      0,
      selected ? -46 : -39,
    ],
  });

/* ============================================================
   CONTROLADOR DEL MAPA
============================================================ */

function MapController({
  branches,
  selectedBranch,
}: {
  branches: Branch[];
  selectedBranch: Branch | null;
}) {
  const map = useMap();

  /*
  |--------------------------------------------------------------------------
  | VISTA GENERAL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (selectedBranch) {
      return;
    }

    const validBranches = branches.filter(
      (branch) =>
        branch.latitude != null &&
        branch.longitude != null
    );

    if (!validBranches.length) {
      return;
    }

    const bounds = L.latLngBounds(
      validBranches.map((branch) => [
        branch.latitude!,
        branch.longitude!,
      ])
    );

    map.fitBounds(bounds, {
      paddingTopLeft: [70, 70],
      paddingBottomRight: [70, 70],

      /*
       * Permite acercarnos un poco más que antes,
       * pero sin perder todas las sucursales.
       */
      maxZoom: 11,
    });
  }, [branches, selectedBranch, map]);

  /*
  |--------------------------------------------------------------------------
  | SUCURSAL SELECCIONADA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      selectedBranch?.latitude == null ||
      selectedBranch?.longitude == null
    ) {
      return;
    }

    map.flyTo(
      [
        selectedBranch.latitude,
        selectedBranch.longitude,
      ],
      12,
      {
        duration: 0.65,
        easeLinearity: 0.3,
      }
    );
  }, [selectedBranch, map]);

  return null;
}

/* ============================================================
   MAPA
============================================================ */

export default function BranchesMap({
  branches,
  selectedBranch,
  onSelectBranch,
}: BranchesMapProps) {
  const validBranches = useMemo(
    () =>
      branches.filter(
        (branch) =>
          branch.latitude != null &&
          branch.longitude != null
      ),
    [branches]
  );

  return (
    <MapContainer
      center={[20.294, -103.31]}
      zoom={10}
      scrollWheelZoom={false}
      zoomControl={false}
      className="h-full w-full"
    >
      {/* =====================================================
          MAPA BASE
      ====================================================== */}

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Zoom abajo a la derecha */}
      <ZoomControl position="bottomright" />

      {/* =====================================================
          SUCURSALES
      ====================================================== */}

      {validBranches.map((branch) => {
        const isSelected =
          selectedBranch?.id === branch.id;

        const shortName =
          branch.name.replace(
            /^Sucursal\s+/i,
            ''
          );

        return (
          <Marker
            key={branch.id}
            position={[
              branch.latitude!,
              branch.longitude!,
            ]}
            icon={createBranchIcon(isSelected)}
            zIndexOffset={
              isSelected ? 1000 : 0
            }
            eventHandlers={{
              click: () =>
                onSelectBranch(branch),
            }}
          >
            {/* =================================================
                ETIQUETA
            ================================================== */}

            <Tooltip
              permanent={isSelected}
              sticky={!isSelected}
              direction="top"
              offset={[
                0,
                isSelected ? -46 : -38,
              ]}
              opacity={1}
              className={`
                labwork-branch-label
                ${
                  isSelected
                    ? 'labwork-branch-label-selected'
                    : ''
                }
              `}
            >
              {shortName}
            </Tooltip>
          </Marker>
        );
      })}

      {/* =====================================================
          CONTROLADOR
      ====================================================== */}

      <MapController
        branches={validBranches}
        selectedBranch={selectedBranch}
      />
    </MapContainer>
  );
}