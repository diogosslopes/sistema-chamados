import '../index.css'

export default function Select({title, itens}) {

    console.log(itens)

    return (
        <div>
        <label>{title}</label>
        <select >
          <option value={''} >{title}</option>
          {itens.map((i, index) => {
            return (
              <option value={i} key={index}>{i}</option>
            )
          })}
        </select>
      </div>
    )
}