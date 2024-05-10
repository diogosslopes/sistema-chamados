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
import { ButtonGroup } from "@mui/material";
import Axios from "axios";
import moment from "moment";
import TasksReport from "../documents/TasksReport";



const validation = yup.object().shape({

})



export default function Reports() {

  const { user, baseURL } = useContext(AuthContext)

  const [dateIni, setDateIni] = useState()
  const [dateEnd, setDateEnd] = useState()
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



    // Axios.post(`${baseURL}/getReport`, {
    //   taskType: type
    // }).then((result)=>{
    //   console.log(result.data)
    // })

    function formatDate(data){
      let list = []
      data.forEach((doc)=>{
       const formatedDate = moment.utc(doc.created).format("DD/MM/yyyy HH:mm")
        list.push({
          taskId: doc.taskId,
          client: doc.client,
          created: formatedDate,
          obs: doc.obs,
          priority: doc.priority,
          status: doc.status,
          type: doc.type,
          subject: doc.subject,
          userId: doc.userId,
          taskImages: doc.taskImages,
          userEmail: doc.userEmail
        })
      })
      setTasks(list)
      TasksReport(list)
      console.log(list)
    }

    if (unity && type && status) {
      console.log("Dados completos")
      Axios.post(`${baseURL}/getReport`, {
        caseNumber: 1,
        unity: unity,
        taskType: type,
        status: status
      }).then((result) => {
        formatDate(result.data)
      })

    } else if (unity && type) {
      Axios.post(`${baseURL}/getReport`, {
        caseNumber: 2,
        unity: unity,
        taskType: type,
        status: status
      }).then((result) => {
        formatDate(result.data)
      })

    } else if (unity && status) {
      Axios.post(`${baseURL}/getReport`, {
        caseNumber: 3,
        unity: unity,
        taskType: type,
        status: status
      }).then((result) => {
        formatDate(result.data)
      })

    } else if (type && status) {
      Axios.post(`${baseURL}/getReport`, {
        caseNumber: 4,
        unity: unity,
        taskType: type,
        status: status
      }).then((result) => {
        formatDate(result.data)
      })

    } else if (unity) {
      Axios.post(`${baseURL}/getReport`, {
        caseNumber: 5,
        unity: unity,
        taskType: type,
        status: status
      }).then((result) => {
        formatDate(result.data)
      })

    } else if (status) {
      Axios.post(`${baseURL}/getReport`, {
        caseNumber: 6,
        unity: unity,
        taskType: type,
        status: status
      }).then((result) => {
        formatDate(result.data)
      })

    } else if (type) {
      Axios.post(`${baseURL}/getReport`, {
        caseNumber: 7,
        unity: unity,
        taskType: type,
        status: status
      }).then((result) => {
        formatDate(result.data)
      })

    } else {
      Axios.post(`${baseURL}/getReport`, {

      }).then((result) => {
        formatDate(result.data)
      })

    }


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
        <button onClick={() => handleReport(type, status)} >Gerar</button>
        {tasks && <TasksTable tasks={tasks} page='report' />}
      </div>


    </div>
  )
}