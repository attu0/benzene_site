import { useStore } from './store'
import { ENVIRONMENTS, ENV_KEYS } from './env'

export default function UI() {
  const { env, night, explode, transparent, lidar, botCam, speed, distance, set } = useStore()
  return (
    <>
    <div className="panel">
      <h1>benzene</h1>
      <p className="sub">Virtual demo · WASD / arrows to drive · Shift to slow</p>

      <div className="row">
        {ENV_KEYS.map((k) => (
          <button key={k} className={env === k ? 'on' : ''}
                  onClick={() => env !== k && set({ env: k, distance: 0 })}>
            {ENVIRONMENTS[k].label}
          </button>
        ))}
      </div>

      <div className="row">
        <button className={!night ? 'on' : ''} onClick={() => set({ night: false })}>Day</button>
        <button className={night ? 'on' : ''} onClick={() => set({ night: true })}>Night</button>
        <button className={transparent ? 'on' : ''} onClick={() => set({ transparent: !transparent })}>Transparent</button>
      </div>

      <div className="row">
        <button className={lidar ? 'on' : ''} onClick={() => set({ lidar: !lidar })}>Lidar scan</button>
        <button className={botCam ? 'on' : ''} onClick={() => set({ botCam: !botCam })}>Bot cam</button>
      </div>

      <label>Exploded view
        <input type="range" min="0" max="0.4" step="0.005" value={explode}
               onChange={(e) => set({ explode: +e.target.value })} />
      </label>
      <label>Speed {speed.toFixed(2)} m/s
        <input type="range" min="0.1" max="1" step="0.05" value={speed}
               onChange={(e) => set({ speed: +e.target.value })} />
      </label>
      <p className="sub">Travelled: {distance.toFixed(2)} m</p>
    </div>
    {botCam && <div className="botcam"><span>Bot cam</span></div>}
    </>
  )
}