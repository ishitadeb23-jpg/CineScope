import {createContext,useContext,useEffect,useState} from 'react'
import api from '../services/api'
const AuthContext=createContext()
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true)
 useEffect(()=>{const t=localStorage.getItem('cinescope_token');if(!t){setLoading(false);return}api.get('/auth/me').then(r=>setUser(r.data.user)).catch(()=>localStorage.removeItem('cinescope_token')).finally(()=>setLoading(false))},[])
 const login=async(email,password)=>{const {data}=await api.post('/auth/login',{email,password});localStorage.setItem('cinescope_token',data.token);setUser(data.user)}
 const register=async(name,email,password)=>{const {data}=await api.post('/auth/register',{name,email,password});localStorage.setItem('cinescope_token',data.token);setUser(data.user)}
 const logout=()=>{localStorage.removeItem('cinescope_token');setUser(null)}
 return <AuthContext.Provider value={{user,loading,login,register,logout}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext)
