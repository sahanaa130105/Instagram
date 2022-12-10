import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import defaultImg from '../../assets/dafault.png'
import { url } from '../../baseUrl';
import { AuthContext } from '../../context/Auth';
import { api } from '../../Interceptor/apiCall';
import { db } from '../../firebase'
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function RoomName({ roomId }) {

    const q = query(collection(db, roomId), orderBy("timestamp", "desc"), limit(1))

    const context = useContext(AuthContext)
    const [roomImage, setRoomImage] = useState()
    const [roomName, setRoomName] = useState('')
    const [lastmessage, setlastmessage] = useState('')
    useEffect(() => {
        api.get(`${url}/chat/${roomId}`).then(res => {
            const nameArr = res.data.people.filter(id => id !== context.auth._id)
            return api.get(`${url}/user/get/${nameArr[0]}`).then((res) => {
                setRoomName(res.data.name);
                setRoomImage(res.data.avatar)
            })
        }).then((resp => {
            setRoomName(resp.data.name)
        })).catch(err => console.log(err))
    }, [context.auth._id, roomId])

    useEffect(() => {
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push(doc.data());
            });
            setlastmessage(messages[0].message)
        });
        return () => unsubscribe()
    }, [])

    return (
        <Link to={`/chats/${roomId}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: "18px 0", paddingLeft: '22px', cursor: 'pointer' }} >
            <img style={{ borderRadius: '50%', width: '55px' }} src={roomImage || defaultImg} alt="" />
            <div className="nameandmsg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '12px', }}>
                <p style={{ fontSize: '15.75px' }}>{roomName ? roomName : "...."}</p>
                <p style={{ fontSize: '14px', color: 'gray' }}>{lastmessage === "like_true" ? <FavoriteIcon sx={{ fontSize: '18px', marginTop: '4px', color: 'red' }} /> : lastmessage.includes("http") ? "image" : lastmessage.length > 27 ? lastmessage.slice(0, 27) + "  ..." : lastmessage}</p>
            </div>
        </Link>
    )
}
