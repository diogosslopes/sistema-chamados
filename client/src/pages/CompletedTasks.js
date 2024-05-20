import { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Title from "../components/Title";
import { FiEdit2, FiMessageSquare, FiPlus, FiSearch } from "react-icons/fi";
import { Link } from 'react-router-dom'
import Modal from "../components/Modal";
import firebase from '../services/firebaseConnection';
import TasksTable from "../components/TasksTable"

import { AuthContext } from "../context/auth";
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { toast } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import { format } from 'date-fns'
import emailjs from '@emailjs/browser'
import Axios from "axios";
import Loading from "../components/Loading.js";
import moment from "moment";


const validation = yup.object().shape({
  client: yup.string(),
  subject: yup.string().required("Assunto obrigatorio").min(5, "Minimo de 5 caracteres").max(15, "Maximo de 15 caracteres"),
  obs: yup.string().required('Descrição é obrigatorio').min(10, 'Minimo de 10 caracteres').max(300, 'Maximo de 300 caracteres'),
})



export default function CompletedTasks() {

  const resolveAfter3Sec = new Promise(resolve => setTimeout(resolve, 3000))

  const { user, baseURL } = useContext(AuthContext)
  const [tasks, setTasks] = useState([])
  let list = []
  let obsList = []
  let newTasks = []
  let newObsList = []
  const [task, setTask] = useState('')
  const [type, setType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastTask, setLastTask] = useState()
  const [firstTask, setFirstTask] = useState()
  const [loadingMore, setLoadingMore] = useState(false)
  const [firstPage, setFirstPage] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)


  const [newTask, setNewTask] = useState({})
  const [client, setClient] = useState(user.name)
  const [clients, setClients] = useState([])
  const [priority, setPriority] = useState()
  const [subject, setSubject] = useState()
  const [taskType, setTaskType] = useState(['TI', 'Estrutura'])
  const [selectedType, setSelectedType] = useState('')
  const [status, setStatus] = useState('Criado')
  const [created, setCreated] = useState()
  const [concluded, setConcluded] = useState('')
  const [obs, setObs] = useState()
  const [prioritys, setPrioritys] = useState(['Baixa', 'Média', 'Alta'])
  const [subjects, setSubjects] = useState(['Impressora', 'Sistema', 'Internet'])
  const [stats, setStats] = useState(['Criado', 'Aberto', 'Em andamento', 'Enviado p/ tec', 'Aguardando liberação', 'Fechado'])
  const [disable, setDisable] = useState(true)
  const [images, setImages] = useState([])
  const [pages, setPages] = useState()
  const [actualPage, setActualPage] = useState(0)
  const [filtred, setFiltred] = useState(false)



  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validation)
  })


  useEffect(() => {


    getDocs()

    if (user.group === 'admin') {
      setIsAdmin(true)
      setDisable(false)
    }

    async function getpages() {
      Axios.get(`${baseURL}/getPages`).then(async (response) => {
        setPages(response.data[0].pagina)
      })
    }

    getpages()


  }, [])

  async function getDocs() {


    setTasks([])
    Axios.get(`${baseURL}/getCompletedTasks`).then((response) => {
      newTasks = response.data
      Axios.get(`${baseURL}/getObsList`).then((response) => {
        newObsList = response.data
        if (user.group === "admin") {
          loadTasks(newTasks, newObsList)

        } else {
          const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
          const obsDocs = newObsList.filter((o) => user.name === o.client)
          loadTasks(tasksDocs, obsDocs)


        }
      })
    })
  }

  async function loadTasks(docs, obs) {

    const isTaksEmpty = docs.length === 0


    if (!isTaksEmpty) {
      docs.forEach((doc) => {
        obsList = obs.filter((o) => doc.taskId === o.taskid)
        const formatedDate = moment.utc(doc.created).format('DD/MM/YYYY HH:mm:ss')
        const formatedConcludedDate = moment.utc(doc.concluded).format('DD/MM/YYYY HH:mm:ss')
        list.push({
          id: doc.id,
          client: doc.client,
          created: formatedDate,
          concluded: formatedConcludedDate,
          obs: obsList,
          priority: doc.priority,
          status: doc.status,
          type: doc.type,
          subject: doc.subject,
          userId: doc.userId,
          taskId: doc.taskId,
          taskImages: doc.taskImages
        })
      })


      const lastDoc = docs[docs.length - 1]
      setLastTask(lastDoc)
      setFirstTask(docs[0])
      setTasks(tasks => [...tasks, ...list])
      setLoading(false)

    } else {
      setIsEmpty(true)
      setLoading(false)

    }
    setLoadingMore(false)
  }

  async function nextTasks() {


    // setLoadingMore(true)

    // await Axios.get(`${baseURL}/getObsList`).then((response) => {
    //   newObsList = response.data
    //   Axios.post(`${baseURL}/getNextCompletedTasks`, {
    //     taskId: lastTask.taskId,
    //     userGroup: user.group,
    //     userId: user.id,
    //   }).then((response) => {
    //     newTasks = response.data

    //     if (response.data.length > 0) {
    //       if (user.group === "admin") {
    //         setTasks("")
    //         loadTasks(newTasks, newObsList)
    //         setFirstPage(false)
    //       } else {
    //         setTasks("")
    //         const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
    //         const obsDocs = newObsList.filter((o) => user.name === o.client)
    //         loadTasks(tasksDocs, obsDocs)
    //         setFirstPage(false)
    //       }
    //     } else {
    //       setLoadingMore(false)
    //       setIsEmpty(true)
    //       toast.warning("Não existem mais chamados")
    //     }
    //   })
    // })

    setActualPage(actualPage + 1)
    let page = actualPage + 1
    if (page !== pages) {
      await Axios.get(`${baseURL}/getObsList`).then((response) => {
        newObsList = response.data
        Axios.post(`${baseURL}/getNextCompletedTasks`, {
          actualPage: page,
          userGroup: user.group,
          userId: user.id,
          filtred: filtred,
          type: selectedType
        }).then((response) => {
          newTasks = response.data

          if (user.group === "admin") {
            setTasks("")
            loadTasks(newTasks, newObsList)
            setFirstPage(false)

          } else {
            setTasks("")
            const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
            const obsDocs = newObsList.filter((o) => user.name === o.client)
            loadTasks(tasksDocs, obsDocs)
            setFirstPage(false)

          }
        })
      })
    } else {
      setLoadingMore(false)
      setIsEmpty(true)
      setActualPage(pages - 1)
      toast.warning("Não existem mais chamados")

    }


  }

  async function previousTasks() {


    // setLoadingMore(true)

    // await Axios.get(`${baseURL}/getObsList`).then((response) => {
    //   newObsList = response.data
    //   Axios.post(`${baseURL}/getPreviousCompletedTasks`, {
    //     taskId: firstTask.taskId,
    //     userGroup: user.group,
    //     userId: user.id,
    //   }).then((response) => {
    //     newTasks = response.data

    //     if (response.data.length > 0) {
    //       if (user.group === "admin") {
    //         setTasks("")
    //         loadTasks(newTasks, newObsList)
    //         setIsEmpty(false)

    //       } else {
    //         setTasks("")
    //         const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
    //         const obsDocs = newObsList.filter((o) => user.name === o.client)
    //         loadTasks(tasksDocs, obsDocs)
    //         setIsEmpty(false)
    //       }
    //     } else {
    //       setLoadingMore(false)
    //       setFirstPage(true)
    //       toast.warning("Não existem páginas anteriores")
    //     }
    //   })
    // })

    setActualPage(actualPage - 1)
    let page = actualPage - 1


    if (page >= 0) {
      await Axios.get(`${baseURL}/getObsList`).then((response) => {
        newObsList = response.data
        Axios.post(`${baseURL}/getNextCompletedTasks`, {
          actualPage: page,
          userGroup: user.group,
          userId: user.id,
          filtred: filtred,
          type: selectedType
        }).then((response) => {
          newTasks = response.data

          if (user.group === "admin") {
            setTasks("")
            loadTasks(newTasks, newObsList)
            setIsEmpty(false)

          } else {
            setTasks("")
            const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
            const obsDocs = newObsList.filter((o) => user.name === o.client)
            loadTasks(tasksDocs, obsDocs)
            setIsEmpty(false)
          }
        })
      })
    } else {
      setLoadingMore(false)
      setFirstPage(true)
      setActualPage(0)
      toast.warning("Não existem páginas anteriores")

    }


  }

  function newClient(t, item) {
    setType(t)
    setShowModal(!showModal)
    if (t === 'new') {
      setTask('')
    } else {
      setTask('25/01/2023')
    }
  }

  function showForm(e) {
    e.preventDefault()

    const fullDate = format(new Date(), "dd/MM/yyyy HH:mm")
    setCreated(fullDate)

    const elementForm = document.querySelector('.form-task')
    const elementButton = document.querySelector('.new')

    if (elementForm.classList.contains('hide')) {
      elementButton.classList.add('hide')
      elementForm.classList.remove('hide')
    } else {
      elementForm.classList.add('hide')
      elementButton.classList.remove('hide')

    }
  }

  function closeForm() {
    const elementForm = document.querySelector('.form-task')
    const elementButton = document.querySelector('.new')
    if (!elementForm.classList.contains('hide')) {
      elementForm.classList.add('hide')
      elementButton.classList.remove('hide')
    }
  }

  async function filter(e) {

    // e.preventDefault()
    // setLoading(true)
    // setTasks('')
    // setSelectedType(e.target.value)
    // let filterDocs = ""

    // if (user.group === "admin") {
    //   Axios.post(`${baseURL}/filterTasks`, {
    //     type: e.target.value,
    //     table: 'completedTasks'
    //   }).then((response) => {
    //     setIsEmpty(false)
    //     setLoadingMore(false)
    //     loadTasks(response.data, newObsList)
    //   })
    // } else {
    //   Axios.post(`${baseURL}/filterTasks`, {
    //     type: e.target.value,
    //     table: 'completedTasks'
    //   }).then((response) => {
    //     const tasksDocs = response.data.filter((t) => user.email === t.userEmail)
    //     const obsDocs = newObsList.filter((o) => user.name === o.client)
    //     setIsEmpty(false)
    //     setLoadingMore(false)
    //     loadTasks(tasksDocs, obsDocs)
    //   })
    // }


    e.preventDefault()
    setLoading(true)
    setActualPage(0)
    setTasks('')
    setSelectedType(e.target.value)
    let filterDocs = ""

    await Axios.post(`${baseURL}/getFiltredPages`,{
      type: e.target.value,
      table: 'completedtasks'
    }).then(async (response) => {
      console.log(selectedType)
      if(response.data[0].pagina === 1 ){
        console.log("Uma Pagina" + response.data[0].pagina)
        setPages(response.data[0].pagina)
      }else{
        console.log("Mais de uma Pagina" + response.data[0].pagina)
        setPages(response.data[0].pagina)
      }
    })

    if (user.group === "admin") {
      Axios.post(`${baseURL}/filterTasks`, {
        type: e.target.value,
        table: 'completedtasks'
      }).then((response) => {
        setIsEmpty(false)
        setLoadingMore(false)
        loadTasks(response.data, newObsList)
      })
    } else {
      Axios.post(`${baseURL}/filterTasks`, {
        type: e.target.value,
        table: 'completedtasks'
      }).then((response) => {
        const tasksDocs = response.data.filter((t) => user.email === t.userEmail)
        const obsDocs = newObsList.filter((o) => user.name === o.client)
        setIsEmpty(false)
        setLoadingMore(false)
        loadTasks(tasksDocs, obsDocs)
      })
    }
    setFiltred(true)


  }

  async function orderBy(order) {
    setTasks('')

    Axios.post(`${baseURL}/orderBy`, {
      order: order
    }).then((response) => {
      const tasksDocs = response.data

      setIsEmpty(false)
      setLoadingMore(false)
      loadTasks(tasksDocs, newObsList)
    })



  }

  if (loading) {
    return (

      <div className="rigth-container">
        <Sidebar />
        <div className="title">
          <Title name="Chamados Concluidos">
            <FiMessageSquare size={22} />
          </Title>
          <div className="new-task">
            <Loading />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rigth-container">
      <Sidebar />
      <div className="title">
        <Title name="Chamados Concluidos">
          <FiMessageSquare size={22} />
        </Title>
      </div>
      <div className="container-task">
        <form className="form-task hide" >
          <div>
            <div className="tipo_select">
              <label>Tipo</label>
              <select name="taskType" {...register("taskType")} value={taskType} onChange={(e) => { setTaskType(e.target.value) }}>
                <option hidden value={''} >Selecione o tipo de chamado</option>
                <option>TI</option>
                <option>Estrutura</option>
              </select>

            </div>
            <div className="subject_select">
              <label>Assunto</label>
              <select name="subject" {...register("subject")} value={subject} onChange={(e) => { setSubject(e.target.value) }}>
                <option hidden value={''} >Selecione o assunto</option>
                {subjects.map((s, index) => {
                  return (
                    <option value={s} key={index}>{s}</option>
                  )
                })}
              </select>
            </div>
            <div className="priority_select">
              <label>Prioridade</label>
              <select name="priority" {...register("priority")} value={priority} onChange={(e) => { setPriority(e.target.value) }}>
                <option hidden value={''} >Selecione a prioridade</option>
                {prioritys.map((p, index) => {
                  return (
                    <option value={p} key={index}>{p}</option>
                  )
                })}
              </select>
            </div>
            <div className="status_select">
              <label>Status</label>
              <select disabled={disable} name="status" {...register("status")} value={status} onChange={(e) => { setStatus(e.target.value) }}>
                <option hidden value={''} >Selecione o status</option>
                {stats.map((s, index) => {
                  return (
                    <option value={s} key={index}>{s}</option>
                  )
                })}
              </select>
            </div>
            <div className="created">
              <label>Criando em</label>
              <input value={created} name="created" disabled={true} {...register("created")} onChange={(e) => { setCreated(e.target.value) }} placeholder="Criado em" />
            </div>
            <div className="created">
              <label>Concluido em</label>
              <input value={concluded} name="concluded" disabled={true} {...register("concluded")} onChange={(e) => { setConcluded(e.target.value) }} placeholder="Concluido em" />
            </div>
            <div>
              <label>Anexos</label>
              <input type="file" multiple='multiple' onChange={(e) => { setImages(e.target.files) }} />
            </div>
            <div id="obs">
              <label>Observações</label>
              <textarea value={obs} name="obs" {...register("obs")} onChange={(e) => setObs(e.target.value)} placeholder="Observações" />
            </div>
            <div className="buttons">
              <button type='submit' >Salvar</button>
              <button onClick={(e) => showForm(e)}>Cancelar</button>
            </div>
          </div>
          <article className="error-message">
            <p>{errors.client?.message}</p>
            <p>{errors.subject?.message}</p>
            <p>{errors.status?.message}</p>
            <p>{errors.obs?.message}</p>
          </article>
        </form>
        {tasks.length === 0 ?
          <>
            <div className="new-task">
              <span>Não existem chamados registrados...</span>
            </div>
            <div className="filter-select">
              <label>Filtrar</label>
              <select name="selectedType" {...register("selectedType")} value={selectedType} onChange={(e) => { filter(e) }}>
                <option hidden value={''} >Selecione o tipo de chamado</option>
                <option value="TI">TI</option>
                <option value="Estrutura">Estrutura</option>
              </select>
            </div>

          </>
          :
          <div>
            <div className="new-task more-task">

              <div className="filter-select">
                <label>Filtrar</label>
                <select name="selectedType" {...register("selectedType")} value={selectedType} onChange={(e) => { filter(e) }}>
                  <option hidden value={''} >Selecione o tipo de chamado</option>
                  <option value="TI">TI</option>
                  <option value="Estrutura">Estrutura</option>
                </select>
              </div>
            </div>
            {/* <TasksTable tasks={tasks} order={orderBy} page={'completedtasks'} /> */}
            {loadingMore ? <Loading /> : <TasksTable tasks={tasks} order={orderBy} page={'completedtasks'} />}


            {!loadingMore && !firstPage && <button className="button-hover" onClick={previousTasks}>Página Anterior</button>}
            {!loadingMore && !isEmpty && <button className="button-hover" onClick={nextTasks}>Proxima Página</button>}
            {/* {!loadingMore && <button className="button-hover" onClick={(e) => TasksReport(tasks)}>Imprimir</button>} */}

          </div>
        }
      </div>
      {showModal && (
        <Modal tipo={type} close={newClient} item={task} />
      )}
    </div>
  )
}