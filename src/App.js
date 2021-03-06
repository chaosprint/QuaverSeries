import React, { useState, useRef, useEffect } from 'react'
import {AppBar, Toolbar, Typography} from '@material-ui/core/'
import {Modal, Button, TextField, IconButton, InputAdornment} from '@material-ui/core/'

import GitHubButton from 'react-github-btn'
// import VpnKey from '@material-ui/icons/VpnKey';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import Brightness3Icon from '@material-ui/icons/Brightness3';
// import GitHubIcon from '@material-ui/icons/GitHub';

import { ThemeProvider } from '@material-ui/styles';
import {useStyles, theme, buttonTheme, modalStyle} from './styles'

import {firebaseConfig, suffix} from './key'
import {sampleList} from './quaver/samples'
import quaver from './quaver/runtime'
import "./App.css"

import AceEditor from "react-ace";
import {exampleCode} from './example'

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";

// import "ace-builds/src-noconflict/theme-github";

export default function App() { 
    const classes = useStyles();

    const exampleRef = useRef(exampleCode)
    const [example, setExample] = useState(exampleCode)

    const [room, setRoom] = useState()
    const roomRef = useRef(room)

    const passwordRef = useRef("")

    const [disable, setDisable] = useState(true)

    const [needPassword, setNeedPassword] = useState(true)
    // const [showIcon, setShowIcon] = useState(true)
    const [run, setRun] = useState(false)
    const [noUpdate, setNoUpdate] = useState(true)

    const modalRef = useRef()
    const editor = useRef()
    const firepad = useRef()
    const cover = useRef()
    const handleRun = useRef()
    const handleUpdate = useRef()
    const handleStop = useRef()

    var date = new Date()
    var hour = date.getHours()
    const dm = hour < 9 || hour > 15 // darkMode
    const et = dm ? "tomorrow-night" : "tomorrow" // editorTheme
    const editorTheme = useRef(et)
    const [darkMode, setDarkMode] = useState(dm)

    const [open, setOpen] = useState(false)

    const handleModalClose = (e) => {
        setOpen(false)
    }

    const setSize = () => {
        try {
            let w = document.getElementById('AppBar').offsetWidth
            let border =  document.documentElement.clientWidth - w
            let h = document.documentElement.clientHeight
            h = h - document.getElementById('AppBar').offsetHeight - border
            editor.current.container.style.height = `${h}px`
            editor.current.resize()
        } catch {}
    }
    window.onresize = setSize

    const getExampleRef = (roomID) => {
        var ref = window.firebase.database().ref();   
        ref = ref.child(roomID)
        return ref;
    }

    handleRun.current = () => {
        window.firebase.database().ref(room+"/run").set({
            state: true
        });
    }

    handleUpdate.current = () => {
        window.firebase.database().ref(room+"/update").set({
            state: true
        });
    }

    handleStop.current = () => {
        quaver.stop();
        setRun(false)
    }

    useEffect(()=>{
        window.firebase.initializeApp(firebaseConfig);
    }, [])

    useEffect(()=>{

        console.clear()
        let arr = []

        // (a,b)=>a.length - b.length
        Object.keys(sampleList).sort().forEach((item)=>{
            arr.push([item, sampleList[item].length])
        })
        arr.forEach(i=>console.info(...i))
        // console.info(...arr)
        
        const load = ()=> {
            try {
                firepad.current.dispose()
            } catch {}
            try {
                let c = document.getElementById("cover")
                editor.current.container.removeChild(c)
            } catch {}

            var firepadRef = getExampleRef(roomRef.current);

            //// Create ACE
            editor.current = window.ace.edit("firepad");
            editor.current.resize()
            editor.current.setValue("")
            editor.current.setTheme("ace/theme/"+editorTheme.current);
            editor.current.setFontSize("20px");
            editor.current.setOptions({
                fontFamily: "B612 Mono",
                readOnly: true,
                "highlightActiveLine": false
            })
            // editor.current.getSession().on('change', function() {
            //     console.log("change")
            //   });

            editor.current.$blockScrolling = Infinity
            
            var session =  editor.current.getSession();
            session.setUseWrapMode(true);
            session.setUseWorker(false);
            session.setMode("ace/mode/quaver");
            const command = [{
                    name: 'run',
                    bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
                    exec: handleRun.current
                }, {
                    name: 'update',
                    bindKey: {win: 'Shift-Enter', mac: 'Shift-Enter'},
                    exec: handleUpdate.current
                }, {
                    name: 'stop',
                    bindKey: {win: 'Ctrl-Alt-.', mac: 'Command-Shift-.'},
                    exec: handleStop.current
                }, {
                    name: 'comment-norge-mac',
                    bindKey: {win: 'Ctrl-\'', mac: 'Command-\''},
                    exec: editor.current.commands.commands.togglecomment.exec
                }, {
                    name: 'dark-mode',
                    bindKey: {win: 'Ctrl-B', mac: 'Command-B'},
                    exec: changeTheme
                },{
                    name: 'comment-norge-win',
                    bindKey: {win: 'Ctrl-\\', mac: 'Command-\\'},
                    exec: editor.current.commands.commands.togglecomment.exec
                }, {
                name: 'Input',
                bindKey: {win: 'Ctrl-Shift-o', mac: 'Command-Shift-o'},
                exec: handleInput
            }]

            command.forEach(c => editor.current.commands.addCommand(c))

            setSize()
    
            // Create Firepad
            firepad.current = window.Firepad.fromACE(firepadRef, editor.current,
                { richTextToolbar: false, richTextShortcuts: false});

            firepad.current.on('ready', () => {
                try {
                    cover.current = document.createElement("div")
                    cover.current.setAttribute("id", "cover");
                    editor.current.container.appendChild(cover.current)
                    cover.current.style.cssText = `position:absolute;
                        top:0;bottom:0;right:0;left:0;
                        background:rgba(150,150,150,0.1);
                        z-index:100`
                        cover.current.addEventListener("mousedown", e=>{
                            e.stopPropagation()}, true)
                    if (firepad.current.isHistoryEmpty()) {
                        setNeedPassword(false)
                    } else {
                        setNeedPassword(true)
                        editor.current.setOptions({
                            readOnly: true,
                        })
                    }
                } catch(e) {console.log(e)}
            });

            var runRef = window.firebase.database().ref(
                roomRef.current + "/run/state");
            runRef.on("value", (snapshot)=>{
                if (snapshot.val()) {
                    window.firebase.database().ref(roomRef.current+"/run").set({
                        state: false
                    });
                    try{
                        quaver.run(editor.current.getValue())
                    } catch(e) {console.log("run", e)}
                    setRun(true)
                    // setNoUpdate(false)
                    // setTimeout(()=>{setNoUpdate(true)}, 5)             
                }
            })
            var updateRef = window.firebase.database().ref(
                roomRef.current + "/update/state");
            updateRef.on("value", (snapshot)=>{
                if (snapshot.val()) {
                    window.firebase.database().ref(roomRef.current+"/update").set({
                        state: false
                    });
                    try {
                        // should run the selection
                        quaver.update(editor.current.getValue())                        
                    } catch(e) {console.log("update", e)}
                    setRun(true)
                    setNoUpdate(false)
                    setTimeout(()=>{setNoUpdate(true)}, 100)
                }
            })

            setOpen(true);
        }
        return load
    }, [room])

    const handleMouseDownPassword = event => {
        event.preventDefault();
    };

    const changeTheme = ()=>{
        try {
            if (editorTheme.current === "tomorrow") {
                editor.current.setTheme("ace/theme/tomorrow-night")
                editorTheme.current = "tomorrow-night"
                setDarkMode(true)
            } else {
                editor.current.setTheme("ace/theme/tomorrow")
                editorTheme.current = "tomorrow"
                setDarkMode(false)
            }
        } catch (e){console.log(e)}
    }

    const submitRoom = (e) => {
        e.preventDefault();
        if (roomRef.current) {
            setRoom(roomRef.current)
            setDisable(true)
            quaver.stop()
            // setShowIcon(true)
        }
    } // end of submit room

    const sumbitPassword = (e) => {
        e.preventDefault();
        if (passwordRef.current.length >= 6) {
            if (needPassword) {
                try {
                    window.firebase.auth().signInWithEmailAndPassword(
                    roomRef.current+suffix, passwordRef.current).then(
                        cred => {
                            setDisable(false)
                            setOpen(false)
                            setNeedPassword(false)
                            // setShowIcon(false)
                            editor.current.setOptions({
                                readOnly: false
                            })
                            let c = document.getElementById("cover")
                            editor.current.container.removeChild(c)
                        })
                    .catch( e=>{alert("Errors");console.log(e)});
                } catch {}
                
            } else { // empty rooms. do no need password
                window.firebase.auth().createUserWithEmailAndPassword(
                roomRef.current+suffix, passwordRef.current).catch( e => console.log(e) );
                
                setOpen(false)
                setDisable(false)
                setNeedPassword(true)
                // setShowIcon(false)
                editor.current.setOptions({
                    readOnly: false
                })
                let c = document.getElementById("cover")
                editor.current.container.removeChild(c)
                editor.current.setValue("// Hello! Password created!")
            }
        } else {alert("Password much be longer than 6 digits.")}
    }

    const handleInput = () => {
        // let t = new 
        editor.current.session.insert(
            editor.current.getCursorPosition(), "wow")
        // console.log(Date.now())
        console.log(quaver.position())
    }

    const onLoad = (editor) => {

        const setSize = () => {

            let w = document.getElementById('AppBar').offsetWidth * 0.618
            // let border =  document.documentElement.clientWidth - w
            let h = document.documentElement.clientHeight * 0.618;
            // h = h - document.getElementById('AppBar').offsetHeight - border

            editor.container.style.width = `${w}px`
            editor.container.style.height = `${h}px`
            editor.resize()
        }
        setSize()
        window.onresize = setSize
    }

    const handleRunExample = ()=> {
        // console.log(e)
        quaver.run(exampleRef.current)
    }

    const handleUpdateExample = () => {
        quaver.update(exampleRef.current)
    }

    const handleChangeExample = (v) => {
        // console.log(v)
        setExample(v)
        exampleRef.current = v
    }

    return (
        <div className="App">
        <div className={classes.root}>
        <ThemeProvider theme={theme}>
        <AppBar position="static" id="AppBar">
        <Toolbar>

        {room ? <ThemeProvider theme={buttonTheme}>
            <Button
                variant="contained"
                color={run ? "default": "primary"}
                // buttonStyle={{ borderRadius: 0 }} style={{borderRadius:0}}
                style={{borderRadius:0, fontFamily: 'Inconsolata'}}
                disabled={disable || (run)}
                className={classes.button}
                onClick={handleRun.current}>
                Run
            </Button>
            <Button
                variant="contained"
                color={(run && noUpdate)? "primary": "default"}
                disabled={disable || (!run)}
                className={classes.button}
                onClick={handleUpdate.current}
                // buttonStyle={{ borderRadius: 0 }} style={{borderRadius:0}}
                style={{borderRadius:0, fontFamily: 'Inconsolata'}}
                >
                Update
            </Button>

            <Button
                variant="contained" color="secondary"
                className={classes.button} onClick={handleStop.current}
                // buttonStyle={{ borderRadius: 0 }} style={{borderRadius:0}}
                style={{borderRadius:0, fontFamily: 'Inconsolata'}}
                >
                Stop
            </Button>
        </ThemeProvider>: (
        <div id="logo" className="animated fadeInLeft">
            
            <h2>QuaverSeries</h2>
        </div>
        )}
        <div className={classes.room}>
        <form onSubmit={submitRoom}>
            <TextField
                id="room"
                className={classes.text}
                // label="room"
                type="text"
                name="room"
                placeholder="room"
                onChange={e=>{roomRef.current=e.target.value}}
                InputProps={{
                 endAdornment: (
                    <InputAdornment position="end">
                    <IconButton
                     edge="end"
                        aria-label="toggle password visibility"
                        onClick={changeTheme}
                        onMouseDown={handleMouseDownPassword}
                      >
                {room ? (darkMode ? < Brightness3Icon />:<WbSunnyIcon /> ) : null}
              </IconButton>
            </InputAdornment>
          ),
        }}
            />
        </form>
        </div>

        <Modal
            id="modal"
            open={open}
            onClose={handleModalClose}
            onRendered={() => modalRef.current.children[1].children[0].focus()}
        >
        <div style={modalStyle} className={classes.paper}>
            <Typography variant="h6" id="modal-title">
                {needPassword ?
                "Enter the password to edit:"
                :  
                "Create a password to edit:"
                }
            </Typography>
            <form onSubmit={sumbitPassword}>
                <TextField
                    id="password"
                    className={classes.password}
                    type="password"
                    name="password"
                    label="password"
                    autoComplete="password"
                    margin="normal"
                    ref={modalRef}
                    onChange={e=>passwordRef.current=e.target.value}
                />
            </form>
            <Typography variant="body2" id="modal-title">
                *Click the blank area to enter watch mode.
            </Typography>
        </div>
        </Modal>

        </Toolbar>
        </AppBar>
        </ThemeProvider>

        {      
            room ? <div className={classes.firepad} id="firepad"></div> :

            <div>
            <div id="slogan">
            
            <span id="slogana" className="animated fadeIn">Live coding to make music with QuaverSeries</span>
            <span id="sloganb" className="animated fadeIn delay-1s">, elegantly.</span>
            </div>

            <div id="editor">
            <AceEditor
                mode="quaver"
                className="animated fadeIn delay-2s"
                theme="tomorrow-night"
                fontSize="14px"
                width="600px"
                height="500px"
                value={example}
                onLoad={onLoad}
                onChange={handleChangeExample}
                commands={[{
                    name: 'Run', //name for the key binding.
                    bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
                    exec: handleRunExample  //function to execute when keys are pressed.
                }, {
                    name: 'Update',
                    bindKey: {win: 'Shift-Enter', mac: 'Shift-Enter'},
                    exec: handleUpdateExample
                }, {
                    name: 'Stop',
                    bindKey: {win: 'Ctrl-Shift-.', mac: 'Command-Shift-.'},
                    exec: quaver.stop
                }, {
                    name: 'Input',
                    bindKey: {win: 'Ctrl-Shift-o', mac: 'Command-Shift-o'},
                    exec: handleInput
                }]}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
            />
            </ div>
            <div id="github" className="animated fadeIn delay-1s">
                <GitHubButton
                href="https://github.com/chaosprint/QuaverSeries"
                data-color-scheme="no-preference: light; light: light; dark: dark;"
                data-size="large"
                // data-show-count="true"
                aria-label="Star chaosprint/QuaverSeries on GitHub"
                >Star</GitHubButton>
            </div>
            
                {/* <Fab id="github" className="animated fadeIn delay-1s" target={"_blank"} rel={"noopener noreferrer"} href="https://github.com/chaosprint/QuaverSeries"><GitHubIcon /></Fab> */}
            </div>
        }

        </div>
        {/* {(room && showIcon)? <Fab className={classes.fab}  onClick={()=>setOpen(true)}><VpnKey /></Fab>: null} */}

    </div>
  )
};