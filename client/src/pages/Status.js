import { FiUsers, FiTrash, FiEdit2, FiType, FiMenu, FiList } from "react-icons/fi";
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




export default function Subjects() {

    const validation = yup.object().shape({
        status: yup.string().required("Nome é obrigatório")

    })

    const { baseURL } = useContext(AuthContext)

    const [status, setStatus] = useState('') //tasktype
    const [statusId, setStatusId] = useState('') //tasktype
    const [statusList, setStatusList] = useState([]) //tasktype
    const [editing, setEditing] = useState()
    const [showModal, setShowModal] = useState()
    let list = []


    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validation)
    })

    const save = async value => {




        if (editing === true) {
            Axios.put(`${baseURL}/editStatus`, {
                status: status,
                id: statusId
            }).then(() => {
                toast.success('Edição realizada com sucesso')
                setStatus('')
            })
        } else {
            Axios.post(`${baseURL}/registerStatus`, {
                status: status
            }).then(() => {
                toast.success('Status cadastrado com sucesso')
                setStatus('')
            })

        }




    }


    useEffect(() => {


        async function loadTaskType() {

            await Axios.get(`${baseURL}/getStatus`).then((response) => {

                response.data.forEach((doc) => {
                    list.push({
                        id: doc.id,
                        status: doc.status,

                    })

                })

                setStatusList(list)
            })

        }
        loadTaskType()
    }, [status, statusId])




    function editingTaskType(c) {

        setEditing(true)
        setStatus(c.status)
        setStatusId(c.id)
    }

    function deleteItem(id) {
        setShowModal(!showModal)
        setStatusId(id)
    }




    return (
        <div className="rigth-container">
            <Sidebar />
            <div className="title">
                <Title name="Cadastro de Status">
                    <FiList size={22} />
                </Title>
            </div>
            <div className="container-client ">
                <form className="form-profile form-options" onSubmit={handleSubmit(save)}>
                    <div className="form-div">
                        <div >
                            <label>Status</label>
                            <input type='text' name="status" {...register("status")} value={status} onChange={(e) => setStatus(e.target.value)} />

                            <div className="buttons">
                                <button type="submit">Salvar</button>
                                <button type="button" onClick={() => { setStatus("") }}>Limpar</button>
                            </div>
                        </div>
                        <article className="error-message">
                            <p>{errors.taskType?.message}</p>
                        </article>
                    </div>
                </form>
                {statusList.map((c) => {
                    return (
                        <div key={c.id} className="clients-list">
                            <div className="task-types-list">
                                <label>{c.status}</label>
                                <FiEdit2 className="client-btn edit" onClick={() => editingTaskType(c)} />
                                <FiTrash className="client-btn delete" onClick={() => deleteItem(c.id)} />
                            </div>
                        </div>
                    )
                })}
            </div>
            {showModal && (
                <DeleteModal close={deleteItem} id={statusId} bd={"status"} />
            )}
        </div>
    )
}

