let contexto: AudioContext | null = null;
let ativo = false;
let liberado = false;

export function configurarSom(ligado: boolean) {
  ativo = ligado;
}

export function liberarSom() {
  liberado = true;
}

function nota(frequencia: number, atraso = 0) {
  if (!ativo || !liberado || typeof window === "undefined") return;
  try {
    contexto ??= new AudioContext();
    if (contexto.state === "suspended") void contexto.resume();
    const inicio = contexto.currentTime + atraso;
    const oscilador = contexto.createOscillator();
    const volume = contexto.createGain();
    oscilador.type = "sine";
    oscilador.frequency.value = frequencia;
    volume.gain.setValueAtTime(0.0001, inicio);
    volume.gain.exponentialRampToValueAtTime(0.025, inicio + 0.008);
    volume.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.07);
    oscilador.connect(volume).connect(contexto.destination);
    oscilador.start(inicio);
    oscilador.stop(inicio + 0.075);
  } catch {
    // Browsers may deny audio until a direct interaction.
  }
}

export function tocarClique() { nota(650); }
export function tocarAviso() { nota(520); nota(730, 0.11); }
