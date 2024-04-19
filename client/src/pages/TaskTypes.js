import { FiUsers, FiTrash, FiEdit2, FiType } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Title from "../components/Title";
import { useContext, useEffect, useState } from "react";
import firebase from '../services/firebaseConnection';

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from "yup"
import { toast } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";
import DeleteModal from "../components/DeleteModal";
import { AuthContext } from "../context/auth";
import Axios from "axios"




export default function TaskTypes() {

    const validation = yup.object().shape({
        taskType: yup.string().required("Nome é obrigatório")

    })

    const { registerUser, baseURL } = useContext(AuthContext)

    const [taskType, setTaskType] = useState('')
    const [taskTypeId, setTaskTypeId] = useState('')
    const [taskTypeList, setTaskTypeList] = useState([])
    const [editing, setEditing] = useState()
    const [showModal, setShowModal] = useState()
    let list = []

    const elementForm = document.querySelector('.form-client')

    const elementButton = document.querySelector('.new')

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validation)
    })

    const save = async value => {




        if (editing === true) {
            Axios.put(`${baseURL}/editTaskType`, {
                taskType: taskType,
                id: taskTypeId
            }).then(() => {
                toast.success('Edição realizada com sucesso')
                setTaskType('')
            })
        } else {
            Axios.post(`${baseURL}/registerTaskType`, {
                taskType: taskType
            }).then(() => {
                toast.success('Tipo de chamado cadastrado com sucesso')
                setTaskType('')
            })

        }


    }


    useEffect(() => {


        async function loadTaskType() {

            await Axios.get(`${baseURL}/getTaskTypes`).then((response) => {

                response.data.forEach((doc) => {
                    list.push({
                        id: doc.id,
                        taskType: doc.taskType,

                    })

                })

                setTaskTypeList(list)
            })

        }
        loadTaskType()
    }, [taskType, taskTypeId])




    function editingTaskType(c) {

        setEditing(true)
        setTaskType(c.taskType)
        setTaskTypeId(c.id)
    }

    function deleteItem(id) {
        setShowModal(!showModal)
        setTaskTypeId(id)
    }




    return (
        <div className="rigth-container">
            <Sidebar />
            <div className="title">
                <Title name="Tipos de Chamado">
                    <FiType size={22} />
                </Title>
            </div>
            <div className="container-client ">
                <form className="form-profile form-options" onSubmit={handleSubmit(save)}>
                    <div className="form-div">
                        <div >
                            <label>Tipo de chamado</label>
                            <input type='text' name="taskType" {...register("taskType")} value={taskType} onChange={(e) => setTaskType(e.target.value)} />

                            <div className="buttons">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={() => { setTaskType("") }}>Limpar</button>
                            </div>
                        </div>
                        <article className="error-message">
                            <p>{errors.taskType?.message}</p>
                        </article>
                    </div>
                </form>
                {taskTypeList.map((c) => {
                    return (
                        <div key={c.id} className="clients-list">
                            <div className="task-types-list">
                                <label>{c.taskType}</label>
                                <FiEdit2 className="client-btn edit" onClick={() => editingTaskType(c)} />
                                <FiTrash className="client-btn delete" onClick={() => deleteItem(c.id)} />
                            </div>
                        </div>
                    )
                })}
            </div>
            {showModal && (
                <DeleteModal close={deleteItem} id={taskTypeId} bd={"taskTypes"} />
            )}
        </div>
    )
}

