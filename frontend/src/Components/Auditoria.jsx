import { fecha } from '../utils'

function Auditoria({ datos }) {
  return (
    <details className="auditoria">
      <summary>Auditoria del registro</summary>
      <dl className="datos mt-5">
        <div>
          <dt>Alta</dt>
          <dd>{fecha(datos.fechaAlta)}</dd>
          <dd>{datos.usuarioAlta || '-'}</dd>
        </div>
        <div>
          <dt>Ultima modificacion</dt>
          <dd>{fecha(datos.fechaModificacion)}</dd>
          <dd>{datos.usuarioModificacion || '-'}</dd>
        </div>
        <div>
          <dt>Baja</dt>
          <dd>{fecha(datos.fechaBaja)}</dd>
          <dd>{datos.usuarioBaja || '-'}</dd>
        </div>
      </dl>
    </details>
  )
}

export default Auditoria
