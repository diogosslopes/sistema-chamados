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
import { format, formatISO9075, parseISO } from 'date-fns'
import emailjs from '@emailjs/browser'
import TasksReport from "../documents/TasksReport";
import Axios from "axios";
import Loading from "../components/Loading.js";
import moment from "moment";


const validation = yup.object().shape({
  client: yup.string(),
  subject: yup.string().required("Assunto obrigatorio"),
  obs: yup.string().required('Descrição é obrigatorio').min(10, 'Minimo de 10 caracteres').max(300, 'Maximo de 300 caracteres'),
})



export default function Dashboard() {

  const resolveAfter3Sec = new Promise(resolve => setTimeout(resolve, 3000))


  const { user, baseURL } = useContext(AuthContext)
  const [tasks, setTasks] = useState([])
  let list = []
  const [loading, setLoading] = useState(true)
  const [lastTask, setLastTask] = useState()
  const [firstTask, setFirstTask] = useState()
  const [loadingMore, setLoadingMore] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)
  const [firstPage, setFirstPage] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)



  const [newTask, setNewTask] = useState({})
  const [client, setClient] = useState(user.name)
  const [clients, setClients] = useState([])
  const [priority, setPriority] = useState()
  const [subject, setSubject] = useState()
  const [taskType, setTaskType] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [status, setStatus] = useState('Criado')
  const [created, setCreated] = useState()
  const [obs, setObs] = useState([])
  const [prioritys, setPrioritys] = useState(['Baixa', 'Média', 'Alta'])
  const [subjects, setSubjects] = useState([])
  const [statusList, setStatusList] = useState([])
  const [disable, setDisable] = useState(true)
  const [images, setImages] = useState([])
  const [taskImages, setTaskImages] = useState([])
  const [subjectList, setSubjectList] = useState([])
  const [taskTypeList, setTaskTypeList] = useState([])
  const [pages, setPages] = useState()
  const [actualPage, setActualPage] = useState(0)
  const [filtred, setFiltred] = useState(false)


  let obsList = []
  let imagesList = []
  let newTasks = []
  let newObsList = []



  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validation)
  })


  useEffect(() => {

    async function loadClients() {
      await Axios.get(`${baseURL}/getUsers`).then((response) => {
        let list = []
        setClients(response.data)

      })

      getDocs()
    }

    loadClients()

    if (user.group === 'admin') {
      setIsAdmin(true)
      setDisable(false)
    }


  }, [])


  useEffect(() => {
    async function loadStatus() {

      let listStatus = []
      let listSubject = []
      let taskTypeList = []
      await Axios.get(`${baseURL}/getStatus`).then((response) => {

        response.data.forEach((doc) => {
          listStatus.push({
            id: doc.id,
            status: doc.status,

          })

        })

        setStatusList(listStatus)
      })

      await Axios.get(`${baseURL}/getSubjects`).then((response) => {
        response.data.forEach((doc) => {
          listSubject.push({
            id: doc.id,
            subject: doc.subject,
            taskType: doc.taskType
          })

        })

        setSubjectList(listSubject)
      })

      await Axios.get(`${baseURL}/getTaskTypes`).then((response) => {

        response.data.forEach((doc) => {
          taskTypeList.push({
            id: doc.id,
            taskType: doc.taskType,

          })

        })

        setTaskTypeList(taskTypeList)
      })

      await Axios.get(`${baseURL}/getPages`).then(async (response) => {
        setPages(response.data[0].pagina)
      })

    }
    loadStatus()
  }, [])

  async function getDocs() {

    setTasks([])
    await Axios.get(`${baseURL}/getObsList`).then((response) => {
      newObsList = response.data
      Axios.get(`${baseURL}/getTasks`).then((response) => {

        newTasks = response.data

        if (user.group === "admin") {
          loadTasks(newTasks, newObsList)

        } else {
          Axios.post(`${baseURL}/getUnitsTasks`, {
            userId: user.id
          }).then((response) => {
            newTasks = response.data
            const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
            const obsDocs = newObsList.filter((o) => user.name === o.client)
            loadTasks(tasksDocs, obsDocs)
          })


        }
      })
    })


  }

  async function loadTasks(docs, obs) {

    if (docs.length < 2) {
      setIsEmpty(true)
    }

    const isTaksEmpty = docs.length === 0

    if (!isTaksEmpty) {
      docs.forEach((doc) => {
        obsList = obs.filter((o) => doc.taskId === o.taskid)
        // const formatedDate = formatISO9075(parseISO(doc.created), "MM-dd-yyyy HH:mm")
        const formatedDate = moment.utc(doc.created).format('DD/MM/YYYY HH:mm:ss')

        list.push({
          taskId: doc.taskId,
          client: doc.client,
          created: formatedDate,
          obs: obsList,
          priority: doc.priority,
          status: doc.status,
          type: doc.type,
          subject: doc.subject,
          userId: doc.userId,
          taskImages: doc.taskImages,
          userEmail: doc.userEmail,
          grade: doc.grade,
          comment: doc.comment,
          responsable: doc.responsable,
        })
        obsList = []
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

  const save = data => {
    saveTask()
  }

  const templateParams = {
    unity: client,
    subject: subject,
    message: obs
  }

  function sendEmail() {

      if(taskType === 'TI'){
        emailjs.send("service_uw92p6x", "template_a9s048m", {
          unity: client,
          subject: subject,
          message: obs,
          emailDest: 'ticentrolab@centrolabvr.com.br'
        }, "BrAq6Nxcac_3F_GXo").then((response) => {
            console.log("Email enviado ", response.status, response.text)
          })
          .catch((err) => {
            console.log(err)
          })
        }else if(taskType === 'Estrutura'){
        emailjs.send("service_uw92p6x", "template_a9s048m", {
          unity: client,
          subject: subject,
          message: obs,
          emailDest: 'compras@centrolabvr.com.br'
        }, "BrAq6Nxcac_3F_GXo").then((response) => {
            console.log("Email enviado ", response.status, response.text)
          })
          .catch((err) => {
            console.log(err)
          })
  
      }
  }

  async function saveTask(e) {

    let taskImagesList = []


    for (let i = 0; i < images.length; i++) {
      await firebase.storage().ref(`task-images/${user.id}/${images[i].name}`)
        .put(images[i])
        .then(async () => {
          await firebase.storage().ref(`task-images/${user.id}`)
            .child(images[i].name).getDownloadURL()
            .then(async (url) => {
              taskImagesList.push(url)
            })
        })

    }
    setTaskImages(taskImagesList)

    setNewTask({
      client: client,
      subject: subject,
      status: status,
      priority: priority,
      type: taskType,
      created: created,
      obs: obs,
      userId: user.id,
      userEmail: user.email
    })

    await Axios.post(`${baseURL}/registertask`, {
      client: client,
      subject: subject,
      priority: priority,
      status: status,
      type: taskType,
      created: created,
      obs: obs,
      userId: user.id,
      userEmail: user.email
    }).then(async () => {
      await Axios.post(`${baseURL}/searchtask`, {
        client: client,
        created: created,
        obs: obs,
        userEmail: user.email,
        userId: user.id
      }).then((response) => {
        saveObs(response.data[0])
        saveImages(response.data[0], taskImagesList)
        const newObs = {
          client: response.data[0].client,
          created: response.data[0].created,
          obs: response.data[0].obs,
          taskid: response.data[0].id
        }

        const newImage = {
          client: response.data[0].client,
          created: response.data[0].created,
          image: response.data[0].obs,
          taskid: response.data[0].id
        }
        obsList.push(newObs)
        imagesList.push(newImage)
        setTasks([
          ...tasks,
          {
            id: response.data[0].id,
            client: client,
            subject: subject,
            priority: priority,
            status: status,
            type: taskType,
            created: created,
            obs: obsList,
            userId: user.id,
            taskImages: imagesList,
            userEmail: user.email
          }
        ])
      })
    })

    toast.success("Chamado registrado !")
    setTasks('')

    closeForm()
    getDocs()
    sendEmail()


  }

  async function nextTasks() {

    setLoadingMore(true)
    let page = actualPage + 1
    if (page !== pages) {
      await Axios.get(`${baseURL}/getObsList`).then((response) => {
        newObsList = response.data
        Axios.post(`${baseURL}/getNextTasks`, {
          actualPage: page,
          userGroup: user.group,
          userId: user.id,
          filtred: filtred,
          type: selectedType
        }).then((response) => {
          newTasks = response.data
          setActualPage(actualPage + 1)

          if (user.group === "admin") {
            setTasks("")
            loadTasks(newTasks, newObsList)
            setFirstPage(false)
            setLoadingMore(false)


          } else {
            setTasks("")
            const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
            const obsDocs = newObsList.filter((o) => user.name === o.client)
            loadTasks(tasksDocs, obsDocs)
            setFirstPage(false)
            setLoadingMore(false)

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


    setLoadingMore(true)
    let page = actualPage - 1


    if (page >= 0) {
      await Axios.get(`${baseURL}/getObsList`).then((response) => {
        newObsList = response.data
        Axios.post(`${baseURL}/getNextTasks`, {
          actualPage: page,
          userGroup: user.group,
          userId: user.id,
          filtred: filtred,
          type: selectedType
        }).then((response) => {
          newTasks = response.data
          setActualPage(actualPage - 1)

          if (user.group === "admin") {
            setTasks("")
            loadTasks(newTasks, newObsList)
            setIsEmpty(false)
            setLoadingMore(false)


          } else {
            setTasks("")
            const tasksDocs = newTasks.filter((t) => user.email === t.userEmail)
            const obsDocs = newObsList.filter((o) => user.name === o.client)
            loadTasks(tasksDocs, obsDocs)
            setIsEmpty(false)
            setLoadingMore(false)

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

  function showForm(e) {
    e.preventDefault()
    const fullDate = format(new Date(), "yyyy-MM-dd HH:mm:ss")
    // const fullDate = new Date(1,4,24)
    //  format(new Date(), "dd/MM/yyyy HH:mm")
    setCreated(fullDate)

    document.querySelector('.form-task').classList.toggle('show-form-task')
    document.querySelector('.new').classList.toggle('hide')


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

    e.preventDefault()
    setLoading(true)
    setActualPage(0)
    setTasks('')
    setSelectedType(e.target.value)
    let filterDocs = ""

    await Axios.post(`${baseURL}/getFiltredPages`, {
      type: e.target.value
    }).then(async (response) => {
      if (response.data[0].pagina === 1) {
        setPages(response.data[0].pagina)
      } else {
        setPages(response.data[0].pagina)
      }
    })

    if (user.group === "admin") {
      Axios.post(`${baseURL}/filterTasks`, {
        type: e.target.value,
        table: 'tasks'
      }).then((response) => {
        setIsEmpty(false)
        setLoadingMore(false)
        loadTasks(response.data, newObsList)
      })
    } else {
      Axios.post(`${baseURL}/filterTasks`, {
        type: e.target.value,
        table: 'tasks'
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

  async function orderBy(e) {
    setTasks('')

    if (e === 'concluded') {
      const order = 'created'
      const docs = await firebase.firestore().collection('tasks').orderBy(order, 'asc').get()
      await loadTasks(docs)
    } else {
      const order = e
      const docs = await firebase.firestore().collection('tasks').orderBy(order, 'asc').get()
      await loadTasks(docs)
    }

  }

  async function saveObs(doc) {

    Axios.post(`${baseURL}/registerobs`, {
      client: doc.client,
      created: doc.created,
      obs: doc.obs,
      taskid: doc.taskId
    })


  }

  async function saveImages(doc, images) {


    images.map((i) => {

      Axios.post(`${baseURL}/registerImage`, {
        client: doc.client,
        created: doc.created,
        image: i,
        taskid: doc.taskId
      })
    })


  }

  function handleSubjects(value) {
    setTaskType(value)

    setSubjects(subjectList.filter((s) => s.taskType === value))

  }



  if (loading) {
    return (

      <div className="rigth-container">
        <Sidebar />
        <div className="title">
          <Title name="Chamados">
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
        <Title name="Chamados">
          <FiMessageSquare size={22} />
        </Title>
      </div>
      <div className="container-task">
        <form className="form-task" onSubmit={handleSubmit(save)}>
          <div className="form-div form-div-task">
            <div className="tipo_select">
              <label>Tipo</label>
              <select name="taskType" {...register("taskType")} multiple={false} value={taskType} onChange={(e) => { handleSubjects(e.target.value) }}>
                <option hidden value={''} >Selecione o tipo de chamado</option>
                {taskTypeList.map((s, index) => {
                  return (
                    <option value={s.taskType} key={s.id}>{s.taskType}</option>
                  )
                })}
              </select>

            </div>
            <div className="subject_select">
              <label>Assunto</label>
              <select name="subject" {...register("subject")} multiple={false} value={subject} onChange={(e) => { setSubject(e.target.value) }}>
                <option hidden value={''} >Selecione o assunto</option>
                {subjects.map((s, index) => {
                  return (
                    <option value={s.subject} key={s.id}>{s.subject}</option>
                  )
                })}
              </select>
            </div>
            <div className="priority_select">
              <label>Prioridade</label>
              <select name="priority" {...register("priority")} multiple={false} value={priority} onChange={(e) => { setPriority(e.target.value) }}>
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
              <select disabled={disable} name="status" {...register("status")} multiple={false} value={status} onChange={(e) => { setStatus(e.target.value) }}>
                <option hidden value={''} >Selecione o status</option>
                {statusList.map((s) => {
                  return (
                    <option value={s.status} key={s.id}>{s.status}</option>
                  )
                })}
              </select>
            </div>
            <div className="created">
              <label>Criando em</label>
              <input value={created || ''} name="created" disabled={true} {...register("created")} onChange={(e) => { setCreated(e.target.value) }} placeholder="Criado em" />
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
              <Link to='#' className="new button-hover" onClick={showForm}> <FiPlus size={25} /> Abrir Chamado</Link>
            </div>
            <div className="filter-select">
              <label>Filtrar</label>
              <select name="selectedType" {...register("selectedType")} multiple={false} value={selectedType} onChange={(e) => { filter(e) }}>
                <option hidden value={''} >Selecione o tipo de chamado</option>
                <option value="TI">TI</option>
                <option value="Estrutura">Estrutura</option>
              </select>
            </div>

          </>
          :
          <div>
            <div className="new-task more-task">
              <Link to='#' className="new button-hover" onClick={showForm}> <FiPlus size={25} /> Abrir Chamado</Link>
              <div className="filter-select">
                <label>Filtrar</label>
                <select name="selectedType" {...register("selectedType")} multiple={false} value={selectedType} onChange={(e) => { filter(e) }}>
                  <option hidden value={''} >Selecione o tipo de chamado</option>
                  <option value="TI">TI</option>
                  <option value="Estrutura">Estrutura</option>
                </select>
              </div>
            </div>
            {/* <TasksTable tasks={tasks} order={orderBy} getDoc={getDocs} disable='true' /> */}
            {loadingMore ? <Loading /> : <TasksTable tasks={tasks} order={orderBy} getDoc={getDocs} disable='true' />}

            <div className="bottom-menu">
              <div className="bottom-buttons">
                {!loadingMore && !firstPage && <button className="button-hover" onClick={previousTasks}>Página Anterior</button>}
                {!loadingMore && !isEmpty && <button className="button-hover" onClick={nextTasks}>Proxima Página</button>}
                {!loadingMore && <button className="button-hover" onClick={(e) => TasksReport(tasks)}>Imprimir</button>}
              </div>
              {!loadingMore && <label >{`Pagina atual ${actualPage + 1}`}</label>}
            </div>

          </div>
        }
      </div>
    </div>
  )
}