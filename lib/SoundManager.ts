
class SoundManager {

  private enabled = true;
  private unlocked = false;
  private initialised = false;
  private sounds = new Map<string, HTMLAudioElement>();

  setEnabled(value: boolean) {
    this.enabled = value;

    if (!value) {
      this.sounds.forEach(s => {
        s.pause();
        s.currentTime = 0;
      });
    }
  }

  init() {
    if (this.initialised) return;
    this.initialised = true;

    {/* Sfx */}
    this.register("load", "/sounds/load.mp3", false, 0.6);
    this.register("click", "/sounds/click.mp3", false, 0.4);
    this.register("send", "/sounds/send.mp3", false, 0.4);

    {/* Continuous */}
    this.register("electricHum", "/sounds/electricHum.mp3", true, 0);
    this.register("nature", "/sounds/nature.mp3", true, 0);
    this.register("rain", "/sounds/rain.mp3", true, 0);
  }

  register(key: string, src: string, loop = false, volume = 1) {
    if (this.sounds.has(key)) return;

    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;

    this.sounds.set(key, audio);
  }

  get(key: string) {
    return this.sounds.get(key);
  }

  play(key: string) {
    if (!this.enabled) return;

    const audio = this.sounds.get(key);
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {});
    }
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;

    ["rain", "nature", "electricHum"].forEach((key) => {
      const audio = this.sounds.get(key);
      audio?.play().catch(() => {});
    });
  }

  pause(key: string) {
    this.sounds.get(key)?.pause();
  }

  setVolume(key: string, volume: number) {
    const audio = this.sounds.get(key);
    if (audio) audio.volume = volume;
  }
}

export const soundManager = new SoundManager();
