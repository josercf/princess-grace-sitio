import Phaser from 'phaser';
import { BASE_HEIGHT, BASE_WIDTH, type RenderScale } from '../core/scale';

// Pixels internos do canvas por pixel da base 320×180 (ADR-006).
export function resolutionOf(game: Phaser.Game): number {
  return Math.max(1, Math.round(game.scale.width / BASE_WIDTH));
}

// O Phaser amplia a câmera em torno da origem. Com a origem no centro, um
// objeto com scrollFactor 0 sai do lugar quando o zoom é maior que 1, porque
// a rolagem deixa de compensar o deslocamento. Com a origem em (0, 0) o
// desenho, a entrada e o scrollFactor 0 ficam corretos em coordenadas base,
// e o scroll passa a ser o canto superior esquerdo da vista. Os métodos
// abaixo supõem origem no centro no Phaser 3.90 (limites, centralização,
// seguir alvo e worldView, usado no corte de tiles) e são ajustados para a
// origem no canto.
class BaseCoordinatesCamera extends Phaser.Cameras.Scene2D.Camera {
  private readonly boundsScratch = new Phaser.Geom.Rectangle();

  constructor(width: number, height: number) {
    super(0, 0, width, height);
    this.setOrigin(0, 0);
  }

  override clampX(x: number): number {
    const bounds = this.getBounds(this.boundsScratch);
    return Phaser.Math.Clamp(x, bounds.x, Math.max(bounds.x, bounds.right - this.displayWidth));
  }

  override clampY(y: number): number {
    const bounds = this.getBounds(this.boundsScratch);
    return Phaser.Math.Clamp(y, bounds.y, Math.max(bounds.y, bounds.bottom - this.displayHeight));
  }

  override centerOnX(x: number): this {
    this.scrollX = x - this.displayWidth / 2;
    if (this.useBounds) this.scrollX = this.clampX(this.scrollX);
    return this;
  }

  override centerOnY(y: number): this {
    this.scrollY = y - this.displayHeight / 2;
    if (this.useBounds) this.scrollY = this.clampY(this.scrollY);
    return this;
  }

  // Com origem no canto o Phaser colocaria o alvo no canto superior esquerdo;
  // o deslocamento de meia vista mantém o alvo no centro, como antes.
  override startFollow(
    target: Phaser.GameObjects.GameObject | object,
    roundPixels?: boolean,
    lerpX?: number,
    lerpY?: number,
    offsetX = 0,
    offsetY = 0,
  ): this {
    return super.startFollow(target, roundPixels, lerpX, lerpY, offsetX + this.displayWidth / 2, offsetY + this.displayHeight / 2);
  }

  override preRender(): void {
    super.preRender();
    const width = this.displayWidth;
    const height = this.displayHeight;
    this.midPoint.set(this.scrollX + width / 2, this.scrollY + height / 2);
    this.worldView.setTo(Math.floor(this.scrollX + 0.5), Math.floor(this.scrollY + 0.5), Math.floor(width + 0.5), Math.floor(height + 0.5));
  }
}

// Troca a câmera principal da cena por uma que desenha em coordenadas base
// na resolução interna do canvas. Chamar no início do create de cada cena.
export function useDeviceResolution(scene: Phaser.Scene): Phaser.Cameras.Scene2D.Camera {
  const manager = scene.cameras;
  const resolution = resolutionOf(scene.game);
  if (manager.main instanceof BaseCoordinatesCamera) return manager.main.setZoom(resolution);

  const camera = new BaseCoordinatesCamera(scene.scale.width, scene.scale.height);
  camera.setScene(scene);
  manager.remove(manager.main);
  manager.addExisting(camera, true);
  return camera.setZoom(resolution);
}

// Aplica uma nova escala ao jogo em execução. Se a resolução não muda, só a
// ampliação CSS é atualizada. Textos já criados mantêm a resolução antiga até
// a cena ser recriada.
export function applyRenderScale(game: Phaser.Game, scale: RenderScale): void {
  if (scale.resolution !== resolutionOf(game)) {
    game.scale.resize(BASE_WIDTH * scale.resolution, BASE_HEIGHT * scale.resolution);
    for (const scene of game.scene.getScenes(false)) {
      scene.cameras?.main?.setZoom(scale.resolution);
    }
  }
  game.scale.setZoom(scale.displayZoom / scale.resolution);
}
