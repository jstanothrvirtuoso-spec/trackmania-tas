
export default function VideoBackground() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-full object-cover"
    >
      <source src="/videos/wallpaper.mp4" type="video/mp4" />
    </video>
  );
}