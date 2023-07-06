import GUI from 'lil-gui'
import { Renderer, Program, Vec2, Mesh, Triangle, Texture } from 'ogl'
import vertex from '@/js/glsl/main.vert'
import fragment from '@/js/glsl/main.frag'
// import LoaderManager from '@/js/managers/LoaderManager'

class Scene {
  #renderer
  #mesh
  #program
  #guiObj = {
    offset: 1,
  }
  constructor() {
    // this.setGUI()
    this.setScene()
    this.events()
  }

  setGUI() {
    const gui = new GUI()

    const handleChange = (value) => {
      this.#program.uniforms.uOffset.value = value
    }

    gui.add(this.#guiObj, 'offset', 0.5, 4).onChange(handleChange)
  }

  async loadTexture(url) {
    return new Promise((resolve) => {
      const image = new Image()
      const texture = new Texture(this.#renderer.gl)

      image.onload = () => {
        texture.image = image
        resolve(texture)
      }

      image.src = url
    })
  }


  async setScene() {
    const canvasEl = document.querySelector('.scene')
    this.#renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), canvas: canvasEl })
    const gl = this.#renderer.gl
    gl.clearColor(1, 1, 1, 1)

    // load our texture
    const texture = await this.loadTexture('./img/image-2.jpg')

    this.handleResize()

    // Rather than using a plane (two triangles) to cover the viewport here is a
    // triangle that includes -1 to 1 range for 'position', and 0 to 1 range for 'uv'.
    // Excess will be out of the viewport.

    //         position                uv
    //      (-1, 3)                  (0, 2)
    //         |\                      |\
    //         |__\(1, 1)              |__\(1, 1)
    //         |__|_\                  |__|_\
    //   (-1, -1)   (3, -1)        (0, 0)   (2, 0)

    const geometry = new Triangle(gl)

    this.#program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: texture },
        uTextureResolution: { value: new Vec2(texture.image.width, texture.image.height) },
        uResolution: { value: new Vec2(gl.canvas.offsetWidth, gl.canvas.offsetHeight) },
      },
    })

    this.#mesh = new Mesh(gl, { geometry, program: this.#program })
  }

  events() {
    window.addEventListener('resize', this.handleResize, false)
    requestAnimationFrame(this.handleRAF)
  }

  handleResize = () => {
    this.#renderer.setSize(window.innerWidth, window.innerHeight)

    if (this.#program) {
      this.#program.uniforms.uResolution.value = new Vec2(window.innerWidth, window.innerHeight)
    }
  }

  handleRAF = (t) => {
    requestAnimationFrame(this.handleRAF)

    // Don't need a camera if camera uniforms aren't required
    if (this.#mesh) this.#renderer.render({ scene: this.#mesh })
  }
}

export default Scene
