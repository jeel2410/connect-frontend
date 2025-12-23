import React, { useState } from 'react'
import '../styles/style.css'
import Header from '../component/Header'
import Footer from '../component/Footer'
import Sidebar from '../component/Sidebar'
import searchIcon from '../assets/image/serachIcon.png'
import profile1 from '../assets/image/profile/profile1.png'
import profile2 from '../assets/image/profile/profile2.png'
import profile3 from '../assets/image/profile/profile3.png'
import profile4 from '../assets/image/profile/profile4.png'
import profile5 from '../assets/image/profile/profile5.png'
import profile6 from '../assets/image/profile/profile6.png'
import sendIcon from "../assets/image/sendIcon.png"

export default function Chat() {
  const [selectedContact, setSelectedContact] = useState(2) // Theresa Webb is selected by default

  const contacts = [
    {
      id: 1,
      name: 'Courtney Henry',
      lastMessage: 'Duis volutpat viverr...',
      time: '07:40 AM',
      unread: 5,
      avatar: profile1
    },
    {
      id: 2,
      name: 'Theresa Webb',
      lastMessage: 'Vestibulum eu tristique est...',
      time: '12:23 AM',
      unread: 0,
      avatar: profile2
    },
    {
      id: 3,
      name: 'Savannah Nguyen',
      lastMessage: 'Phasellus eu quam 🤠',
      time: '07:13 PM',
      unread: 0,
      avatar: profile3
    },
    {
      id: 4,
      name: 'John Doe',
      lastMessage: 'Maecenas venenatis 🥰',
      time: '06:45 PM',
      unread: 0,
      avatar: profile4
    },
    {
      id: 5,
      name: 'Jane Smith',
      lastMessage: 'Lorem ipsum dolor sit...',
      time: '05:30 PM',
      unread: 0,
      avatar: profile5
    },
    {
      id: 6,
      name: 'Mike Johnson',
      lastMessage: 'Sed do eiusmod tempor...',
      time: '04:15 PM',
      unread: 0,
      avatar: profile6
    }
  ]

  const messages = [
    {
      id: 1,
      sender: 'theresa',
      text: "Hello !! How are you?",
      time: '11:23 AM'
    },
    {
      id: 2,
      sender: 'theresa',
      text: "I'm John and today I'm going to help you to find your perfect Dating App 🧑‍💻",
      time: '11:23 AM'
    },
    {
      id: 3,
      sender: 'theresa',
      text: "I am sending my pic",
      time: '11:23 AM'
    },
    {
      id: 4,
      sender: 'me',
      text: "i am Fine What's going on?",
      time: '11:24 AM'
    },
    {
      id: 5,
      sender: 'me',
      text: "i am Fine What's going on?",
      time: '11:24 AM'
    },
    {
      id: 6,
      sender: 'me',
      text: "I am sendign you gift !!! 🥰🥰",
      time: '11:24 AM'
    }
  ]

  const activeContact = contacts.find(contact => contact.id === selectedContact)

  return (
    <>
      <Header />
      <div className="chat-page-wrapper">
        <Sidebar />
        <div className="chat-container">
          <div className="chat-sidebar">
            <div className="chat-header">
              <h1>Chat</h1>
            </div>
            
            <div className="chat-search">
              <img src={searchIcon} alt="Search" className="search-icon" />
              <input type="text" placeholder="Search here." />
            </div>

            <div className="chat-contacts">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className={`chat-contact-item ${selectedContact === contact.id ? 'active' : ''}`}
                  onClick={() => setSelectedContact(contact.id)}
                >
                  <div className="contact-avatar">
                    <img src={contact.avatar} alt={contact.name} />
                    {/* {contact.unread > 0 && (
                      <span className="unread-badge">{contact.unread}</span>
                    )} */}
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-message">{contact.lastMessage}</div>
                  </div>
                  <div className="contact-time">{contact.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Chat Messages */}
          <div className="chat-main">
            {activeContact && (
              <>
                <div className="chat-main-header">
                  <div className="chat-main-avatar">
                    <img src={activeContact.avatar} alt={activeContact.name} />
                  </div>
                  <div className="chat-main-name">{activeContact.name}</div>
                </div>

                <div className="chat-messages">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`message-bubble ${message.sender === 'me' ? 'sent' : 'received'}`}
                    >
                      <div className="message-text">{message.text}</div>
                      <div className="message-time">{message.time}</div>
                    </div>
                  ))}
                </div>

                <div className="chat-input-container">
                  <div className="chat-input-wrapper">
                    <input
                      type="text"
                      placeholder="Your messages..."
                      className="chat-input"
                    />
                    <button className="chat-send-btn">
                      {/* <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 2L10 6L2 10V2Z"
                          fill="white"
                        />
                      </svg> */}
                      <img src={sendIcon}></img>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
