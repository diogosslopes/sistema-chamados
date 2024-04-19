import { useState, createContext, useEffect } from 'react'
import firebase from '../services/firebaseConnection'
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from 'react-router-dom'
import "react-toastify/dist/ReactToastify.css";
import Axios from 'axios';
import emailjs from '@emailjs/browser'


export const AuthContext = createContext({})

function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loadingAuth, setLoadingAuth] = useState(false)
    const [loading, setLoading] = useState(true)


    const [tasks, setTasks] = useState([])
    let list = []
    const [task, setTask] = useState('')
    const [type, setType] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [lastTask, setLastTask] = useState()
    const [loadingMore, setLoadingMore] = useState(false)
    const [isEmpty, setIsEmpty] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isFiltered, setIsFiltered] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)


    const [newTask, setNewTask] = useState({})
    const [client, setClient] = useState('')
    const [clients, setClients] = useState([])
    const [priority, setPriority] = useState()
    const [subject, setSubject] = useState()
    const [taskType, setTaskType] = useState(['TI', 'Estrutura'])
    const [selectedType, setSelectedType] = useState('')
    const [status, setStatus] = useState('Criado')
    const [created, setCreated] = useState()
    const [obs, setObs] = useState()
    const [prioritys, setPrioritys] = useState(['Baixa', 'Média', 'Alta'])
    const [subjectsTi, setSubjectsTi] = useState(['Impressora', 'Sistema', 'Internet'])
    const [subjectsGeneral, setSubjectsGeneral] = useState(['Eletrica', 'Pintura', 'Ar Condicionado', 'Hidraulico', 'Portas', 'Outros'])
    const [subjects, setSubjects] = useState([])
    const [stats, setStats] = useState(['Criado', 'Aberto', 'Em andamento', 'Enviado p/ tec', 'Aguardando liberação', 'Fechado'])
    const [disable, setDisable] = useState(true)
    const [images, setImages] = useState([])
    let filterDocs = ""

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {


        function userLoged() {
            const activeUser = localStorage.getItem('activeUser')

            if (activeUser) {
                setUser(JSON.parse(activeUser))
                setClient(user)
                setLoading(false)
                setLoggedIn(true)
            }


            setLoading(false)
        }
        userLoged()
    }, [])


    function sendEmail(user) {

        const templateParams = {
            client: user.name,
            emailToken: user.emailToken,
            email: user.email
        }

        emailjs.send("service_g9rl1tf", "template_2caaac1", templateParams, "mBCqpYRtx6G_wfeFI")
            .then((response) => {
                console.log("Email enviado ", response.status, response.text)
            })
    }


    const baseURL = "https://server-three-navy.vercel.app"
    // const baseURL = "http://localhost:3001"

    async function registerUser(value) {

        const numbers = {
            n1: Math.floor(Math.random() * 10),
            n2: Math.floor(Math.random() * 10),
            n3: Math.floor(Math.random() * 10),
            n4: Math.floor(Math.random() * 10),
        }
        const emailToken = `${numbers.n1}${numbers.n2}${numbers.n3}${numbers.n4}`


        setLoadingAuth(true)

        await Axios.post(`${baseURL}/registeruser`, {
            email: value.login,
            password: value.password,
            name: value.name,
            adress: value.adress,
            emailToken: emailToken
        }).then((response) => {
            if (response.data.msg === 'cadastrado') {
                toast.error("Email já cadastrado!!!")
                setLoadingAuth(false)
                return
            }
            let userData = {
                name: value.name,
                email: value.login,
                password: value.password,
                emailToken: emailToken,
                avatar: null,
                group: null
            }
            toast.success("Cadastrado com sucesso!")
            setUser(userData)
            setLoadingAuth(false)
            setLoggedIn(true)
            sendEmail(userData)
            navigate('/confirmation')
        }).catch((error) => {
            setLoggedIn(false)
            console.log(error)
            setLoadingAuth(true)
        })


    }

    function resendConfirmation(response) {

        const numbers = {
            n1: Math.floor(Math.random() * 10),
            n2: Math.floor(Math.random() * 10),
            n3: Math.floor(Math.random() * 10),
            n4: Math.floor(Math.random() * 10),
        }
        const emailToken = `${numbers.n1}${numbers.n2}${numbers.n3}${numbers.n4}`
        const newConfirmation = {
            name: response.name,
            emailToken: emailToken,
            email: response.email,
            password: response.password
        }



        Axios.post(`${baseURL}/resendConfirmation`, {
            email: newConfirmation.email,
            emailToken: newConfirmation.emailToken
        }).then(() => {

            setUser(newConfirmation)
            sendEmail(newConfirmation)
            navigate('/confirmation')

        })

    }



    async function logIn(value) {
        setLoadingAuth(true)

        Axios.post(`${baseURL}/login`, {
            email: value.login,
            password: value.password
        }).then((response) => {

            if (response.data.msg === "inexistente") {
                toast.error("Usuario não cadastrado!")
                setLoadingAuth(false)
            } else if (response.data) {
                Axios.post(`${baseURL}/getUser`, {
                    email: value.login,
                    password: value.password
                }).then((response) => {
                    if (response.data[0].isVerified !== '1') {

                        const nonConfirmedUser = {
                            name: response.data[0].name,
                            email: response.data[0].email,
                            password: value.password
                        }
                        toast.warn("Acesse seu e-mail para confirmação de cadastro.")

                        resendConfirmation(nonConfirmedUser)

                    } else if (response.data[0].isVerified === '1') {
                        let userData = {
                            id: response.data[0].clientId,
                            name: response.data[0].name,
                            email: value.login,
                            avatar: response.data[0].avatar,
                            group: response.data[0].group,

                        }
                        storage(userData)
                        setUser(userData)

                        navigate('/dashboard')


                    }
                })

                setLoadingAuth(false)
                setLoggedIn(true)

            } else {
                setLoadingAuth(false)
                toast.error("Usuario ou senha incorretos!")
            }

        })



    }

    function storage(userData) {
        localStorage.setItem('activeUser', JSON.stringify(userData))
    }

    async function signOut() {
        localStorage.removeItem('activeUser')
        setUser(null)
    }





    return (
        <AuthContext.Provider value={{
            signed: !!user, user, baseURL, loading, registerUser, signOut, logIn, loadingAuth, storage, loggedIn
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider