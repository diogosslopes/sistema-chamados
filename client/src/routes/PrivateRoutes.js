
import { Children, useContext, useEffect, useState } from 'react';
import { Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth'
import Dashboard from '../pages/Dashboard';




const PrivateRoutes = ({children}) =>{

const { user, signed } = useContext(AuthContext)




return(
    signed ? children  : <Navigate raplace to="/" />
)


} 

export default PrivateRoutes

// {
  

//   if(loading){
//     return(
//       <div></div>
//     )
//   }

//  console.log(loggedIn)
//   if(!signed && isPrivate){
//     return <Route to="/" />
//   }

//   if(signed && !isPrivate){
//     return <Route to="/dashboard" />
//   }




//   return(
//     <Route
//       {...rest}
//       render={ props => (
//         <Component {...props} />
//       )}
//     />
//   )
// }