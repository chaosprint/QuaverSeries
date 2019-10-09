import React, { useState, useRef, useEffect } from 'react'
import {AppBar, Toolbar, Typography, Paper, Grid} from '@material-ui/core/'
import {Modal, Button, TextField, Fab} from '@material-ui/core/'

import VpnKey from '@material-ui/icons/VpnKey';
import { ThemeProvider } from '@material-ui/styles';
import {useStyles, theme, buttonTheme, modalStyle} from './styles'

import {firebaseConfig, suffix} from './key'
import quaver from './engine'
import "./App.css"

export default function App() {
    const classes = useStyles();

    const [room, setRoom] = useState()
    const roomRef = useRef(room)

    const passwordRef = useRef()

    const [disable, setDisable] = useState(true)

    const [needPassword, setNeedPassword] = useState(true)
    const [showIcon, setShowIcon] = useState(true)

    const modalRef = useRef()
    const editor = useRef()
    const firepad = useRef()
    const cover = useRef()
    const handleRun = useRef()
    const handleUpdate = useRef()
    const handleStop = useRef()
    const editorTheme = useRef("tomorrow")

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

    handleStop.current = () => {quaver.stop()}

    useEffect(()=>{
        window.firebase.initializeApp(firebaseConfig);
    }, [])

    useEffect(()=>{
        
        const load = ()=> {
            try {
                firepad.current.dispose()
            } catch {}
            try {
                let c = document.getElementById("cover")
                editor.current.container.removeChild(c)
            } catch(e) {console.log(e)}

            var firepadRef = getExampleRef(roomRef.current);

            //// Create ACE
            editor.current = window.ace.edit("firepad");
            editor.current.resize()
            editor.current.setValue("")
            editor.current.setTheme("ace/theme/"+editorTheme.current);
            editor.current.setFontSize("20px");
            editor.current.setOptions({
                fontFamily: "Fira Code",
                readOnly: true,
                "highlightActiveLine": false
            })
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
                    bindKey: {win: 'Ctrl-Alt-.', mac: 'Command-.'},
                    exec: handleStop.current
                }, {
                    name: 'comment-norge-mac',
                    bindKey: {win: 'Ctrl-\'', mac: 'Command-\''},
                    exec: editor.current.commands.commands.togglecomment.exec
                }, {
                    name: 'dark-mode',
                    bindKey: {win: 'Ctrl-B', mac: 'Command-B'},
                    exec: ()=>{
                        if (editorTheme.current === "tomorrow") {
                            editor.current.setTheme("ace/theme/tomorrow-night")
                            editorTheme.current = "tomorrow-night"
                        } else {
                            editor.current.setTheme("ace/theme/tomorrow")
                            editorTheme.current = "tomorrow"
                        }
                    }
                },{
                    name: 'comment-norge-win',
                    bindKey: {win: 'Ctrl-\\', mac: 'Command-\\'},
                    exec: editor.current.commands.commands.togglecomment.exec
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
                    } catch {}                    
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
                        quaver.update(editor.current.getValue())
                    } catch {}                    
                }
            })
        }
        return load
    }, [room])

    const submitRoom = (e) => {
        e.preventDefault();
        if (roomRef.current) {
            setRoom(roomRef.current)
            setDisable(true)
            quaver.stop()
            setShowIcon(true)
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
                            setShowIcon(false)
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
                setShowIcon(false)
                editor.current.setOptions({
                    readOnly: false
                })
                let c = document.getElementById("cover")
                editor.current.container.removeChild(c)
                editor.current.setValue("// Hello! Password created!")
            }
        } else {alert("Password much be longer than 6 digits.")}
    }

    return (
        <div className="App">
        <div className={classes.root}>
        <ThemeProvider theme={theme}>
        <AppBar position="static" id="AppBar">
        <Toolbar>

        <ThemeProvider theme={buttonTheme}>
            <Button
                variant="contained" color="primary"
                disabled={disable} className={classes.button} onClick={handleRun.current}>
                Run
            </Button>
            <Button
                variant="contained" color="default" disabled={disable}
                className={classes.button} onClick={handleUpdate.current}>
                Update
            </Button>
            <Button
                variant="contained" color="secondary"
                className={classes.button} onClick={handleStop.current}>
                Stop
            </Button>
        </ThemeProvider>
        <div className={classes.room}>
        <form onSubmit={submitRoom}>
            <TextField
                id="room"
                className={classes.text}
                label="room"
                type="text"
                name="room"
                autoComplete="room"
                margin="normal"
                variant="outlined"
                onChange={e=>{roomRef.current=e.target.value}}
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
                {needPassword ? "Enter the password:":"Create a password:"}
            </Typography>
            <form onSubmit={sumbitPassword}>
                <TextField
                    id="password"
                    className={classes.text}
                    label="password"
                    type="password"
                    name="password"
                    autoComplete="password"
                    margin="normal"
                    variant="filled"
                    ref={modalRef}
                    onChange={e=>passwordRef.current=e.target.value}
                />
            </form>
        </div>
        </Modal>

        </Toolbar>
        </AppBar>
        </ThemeProvider>

        {      
            room ? <div className={classes.firepad} id="firepad"></div> :

            <div className={classes.back}>
            <Grid container alignItems='center' justify='center' direction="column">
            <Grid container className={classes.notice} alignItems='center' justify='center'>
            <Paper className={classes.inside}>
                <ThemeProvider theme={theme}>
                <Typography variant="h6" component="h6">
                QuaverSeries is a live coding environment for music performance. <br />
                For further informantion, please see <a target={"_blank"} rel={"noopener noreferrer"} href={"https://github.com/chaosprint/QuaverSeries"}>QuaverSeries GitHub repository</a>.
                </Typography>
                </ThemeProvider>
            </Paper>

            </Grid>
            </Grid>
            </div>
        }

        {(room && showIcon)? <Fab className={classes.fab}  onClick={()=>setOpen(true)}><VpnKey /></Fab>: null}

        </div>
    </div>
  )
};