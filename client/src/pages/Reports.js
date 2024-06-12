import { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Title from "../components/Title";
import { FiEdit2, FiMessageSquare, FiPlus, FiSearch } from "react-icons/fi";
import { Link } from 'react-router-dom'
import Modal from "../components/Modal";
import firebase from '../services/firebaseConnection';
import TasksTable from "../components/TasksTable"
import { SiMicrosoftexcel } from "react-icons/si"

import { AuthContext } from "../context/auth";
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { toast } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import { format } from 'date-fns'
import emailjs from '@emailjs/browser'
import { ButtonGroup } from "@mui/material";
import Axios from "axios";
import moment from "moment";
import TasksReport from "../documents/TasksReport";
var XLSX = require("xlsx")



const validation = yup.object().shape({

})



export default function Reports() {

  const { user, baseURL } = useContext(AuthContext)

  const [dateIni, setDateIni] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [unity, setUnity] = useState()
  const [status, setStatus] = useState()
  const [type, setType] = useState()
  const [subjectList, setSubjectList] = useState([])
  const [taskTypeList, setTaskTypeList] = useState([])
  const [statusList, setStatusList] = useState([])
  const [unitsList, setUnitsList] = useState([])
  const [unitId, setUnitId] = useState()
  const [tasks, setTasks] = useState()



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
            value: doc.value,

          })

        })
        setTaskTypeList(taskTypeList)
      })

    }
    loadStatus()

    async function loadUnits() {
      await Axios.get(`${baseURL}/getUsers`).then((response) => {
        let list = []
        setUnitsList(response.data)

      })


    }

    loadUnits()
  }, [])

  function handleReport() {
    console.log("Gerou")

    console.log(dateEnd)
    console.log(dateIni)

    if(dateIni !== '' && dateEnd !== ''){

    
      function formatDate(data) {
        let list = []
        data.forEach((doc) => {
          const formatedDate = moment.utc(doc.created).format("DD/MM/yyyy HH:mm")
          list.push({
            taskId: doc.taskId,
            client: doc.client,
            created: formatedDate,
            obs: [{obs: doc.obs}] ,
            priority: doc.priority,
            status: doc.status,
            type: doc.type,
            subject: doc.subject,
            userId: doc.userId,
            taskImages: doc.taskImages,
            userEmail: doc.userEmail,
            grade: doc.grade,
            comment: doc.comment
          })
        })
        setTasks(list)
        
      }
  
      if (unity && type && status) {
        console.log("Dados completos")
        Axios.post(`${baseURL}/getReport`, {
          caseNumber: 1,
          unity: unity,
          taskType: type,
          status: status,
          dateIni: dateIni,
          dateFin: dateEnd
        }).then((result) => {
          formatDate(result.data)
        })
  
      } else if (unity && type) {
        Axios.post(`${baseURL}/getReport`, {
          caseNumber: 2,
          unity: unity,
          taskType: type,
          status: status,
          dateIni: dateIni,
          dateFin: dateEnd
        }).then((result) => {
          formatDate(result.data)
        })
  
      } else if (unity && status) {
        Axios.post(`${baseURL}/getReport`, {
          caseNumber: 3,
          unity: unity,
          taskType: type,
          status: status,
          dateIni: dateIni,
          dateFin: dateEnd
        }).then((result) => {
          formatDate(result.data)
        })
  
      } else if (type && status) {
        Axios.post(`${baseURL}/getReport`, {
          caseNumber: 4,
          unity: unity,
          taskType: type,
          status: status,
          dateIni: dateIni,
          dateFin: dateEnd
        }).then((result) => {
          formatDate(result.data)
        })
  
      } else if (unity) {
        Axios.post(`${baseURL}/getReport`, {
          caseNumber: 5,
          unity: unity,
          taskType: type,
          status: status,
          dateIni: dateIni,
          dateFin: dateEnd
        }).then((result) => {
          formatDate(result.data)
        })
  
      } else if (status) {
        Axios.post(`${baseURL}/getReport`, {
          caseNumber: 6,
          unity: unity,
          taskType: type,
          status: status,
          dateIni: dateIni,
          dateFin: dateEnd
        }).then((result) => {
          formatDate(result.data)
        })
  
      } else if (type) {
        Axios.post(`${baseURL}/getReport`, {
          caseNumber: 7,
          unity: unity,
          taskType: type,
          status: status,
          dateIni: dateIni,
          dateFin: dateEnd
        }).then((result) => {
          formatDate(result.data)
        })
  
      } else {
        Axios.post(`${baseURL}/getReport`, {
          dateIni: dateIni,
          dateFin: dateEnd
  
        }).then((result) => {
          formatDate(result.data)
        })
  
      }
    }else{
      toast.warn('Preencher datas')
    }
  }

  function handleXLSX(){
    
    let list = []
    tasks.forEach((doc)=>{
      list.push({
        Id: doc.taskId,
        Unidade: doc.client,
        Criado: doc.created,
        Tipo: doc.type,
        Assunto: doc.subject,
        Descrição: doc.obs,
        Prioridade: doc.priority,
        Nota: doc.grade,
        Comentário: doc.comment
      })

    })

    var wb = XLSX.utils.book_new()
    var ws = XLSX.utils.json_to_sheet(list)

    XLSX.utils.book_append_sheet(wb, ws, "Relatorio")

    XLSX.writeFile(wb, 'Relatorio.xlsx')
  }

  return (
    <div className="rigth-container">
      <Sidebar />
      <div className="title">
        <Title name="Relatorios">
          <FiMessageSquare size={22} />
        </Title>
      </div>
      <div className="container-task container-reports">
        <div className="reports">
          <label>Data Inicio</label>
          <input type="date" value={dateIni} onChange={(e) => { setDateIni(e.target.value) }}></input>
          <label>Data Fim</label>
          <input type="date" value={dateEnd} onChange={(e) => { setDateEnd(e.target.value) }}></input>
        </div>
        <div className="reports">
          <label>Unidade</label>
          <select value={unity} onChange={(e) => { setUnity(e.target.value) }}>
            <option value={''} >Todas</option>
            {unitsList.map((u) => {
              return (
                <option value={u.name} key={u.id} >{u.name}</option>
              )
            })}

          </select>
        </div>
        <div className="reports">
          <label >Status</label>
          <select value={status} onChange={(e) => { setStatus(e.target.value) }}>
            <option value={''} >Todos</option>
            {statusList.map((s) => {
              return (
                <option value={s.status} key={s.id} >{s.status}</option>
              )
            })}
          </select>
        </div>
        <div className="reports">
          <label>Tipo</label>
          <select value={type} onChange={(e) => { setType(`${e.target.value}`) }}>
            <option value={''} >Todos</option>
            {taskTypeList.map((t) => {
              return (
                <option value={t.taskType} key={t.id} >{t.taskType}</option>
              )
            })}
          </select>
        </div>
        <button className="button-hover" onClick={() => handleReport(type, status)} >Gerar</button>
        {tasks &&
          <div>
          <TasksTable tasks={tasks} page='report' />

            <button className="button-hover" onClick={()=>{TasksReport(tasks)}}>Imprimir </button>
            <button className="button-hover" onClick={()=>{handleXLSX(tasks)}}><SiMicrosoftexcel size={15}/> Gerar XLS</button>

          </div>
        }
      </div>


    </div>
  )
}