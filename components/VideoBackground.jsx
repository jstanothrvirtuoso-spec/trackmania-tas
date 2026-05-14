export default function VideoBackground() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/videos/wallpaper.mp4" type="video/mp4" />
      </video>
    </div>
  );
}