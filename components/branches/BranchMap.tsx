type BranchMapProps = {
  name: string;
  address: string;
};

export default function BranchMap({
  name,
  address,
}: BranchMapProps) {
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    address
  )}&output=embed`;

  return (
    <div className="relative min-h-[320px] overflow-hidden bg-primary-50 lg:min-h-[370px]">
      <iframe
        src={mapEmbedUrl}
        title={`Mapa de ${name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0"
        allowFullScreen
      />
    </div>
  );
}