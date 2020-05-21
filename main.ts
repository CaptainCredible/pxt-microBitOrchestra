//  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  !!!!!!!!!! changed timeslot timing to waitmicros NEEDS TESTING !!!!!!!!!
//  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
/**
 * rev 123
 * made timeslot work properly, only allow 1 int to be sent
 * added shake
 * Added thumper scoring
 * started improving waitforstep
 * fixed microbitHero!
*/
let localSeqThumper = false
let allowThumping = true
let thumpPin = DigitalPin.P0
let scoreIsLocked = false
let displayingScore = false
let redirectLocalHW = false
let myBunNumber = 0
let myBunAction = 0
let bunSlave = false
let dualThumpMode = false
let thumpBpin = 0

let gameActivated = true
let receivedPrematureA = false
let prematureAtimer = 0
let ready4A = false
let ready4Atimer = 0

let receivedPrematureB = false
let prematureBtimer = 0
let ready4B = false
let ready4Btimer = 0

let receivedPrematureRist = false
let prematureRistTimer = 0
let ready4Rist = false
let ready4RistTimer = 0

//let instrumentName = "Hen"
let myScore = 0
let slack = 100
let ledIsOn = true
let ledTimer = 0
let shakeTimer = 0
let shake = 0
let shook = 0
let shakeDebounce = 100
let shakeThresh = 700
let conductorPassword = 1983
let enteredPassword = 0
let replaceLastPolyWithThumper = false
let numberOfMusicians = 16 //default number of musicians
let radioSendWindow = 2000
let polySend = false //if we are sending all messages to one instrument
let polyInstrumentName = "Bob"
let polySendBuffer = 0
let timeSlotMode = 0
let timeSlotSpacing = 1 * 1500  //spacing in milliseconds  add 1000 to use micros
let buttonScanSpeed = 10
let oldButtA = false
let oldButtB = false
let musicianIsMuted = false
let ABWasPressed = false
let ABtimer = 0
let Btimer = 0
let numberOfOutputs = 128
let outputMode = 0 // how to automatically handle outputs 0 = none, 1 = pins, 2 = mcp23017
let outputIsOn: boolean[] = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
let onTimer: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
let pinOutputRoutings: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
let InstrumentName = "Bob"
let microBitID = 9876 //9876 is a secret number that lets our code know that this hasn't been set yet
let isInstrument: boolean = false; //this is a flag to remind us wether we are a Instrument or a Musician
let extClock = 0 //0 is int, 1 is ext, 2 is int in sim, 3 is int until clock message received
let auto = true
//sequencer stuff:
let masterTempo = 120
let sequencerExists = false;
let stepLengthms = (60000 / masterTempo) >> 1
let currentStep = 0 // the current step
let masterClockStep = 120
let offLed = 0 // the led to turn off (previous step)
let ledCursor = 0
let seqLength = 16
let part = 0
let oldPart = 99
let seqA = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
let seqB = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
let seqC = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
let seqD = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
let channelIsSetup = [false, false, false, false]
let lastClockTickTime = 0
let triggerBuffer: boolean[] = []
let lastStep = seqLength
let channelSelect = 0
let channelOutNames: string[] = ["Bob", "Tim", "Pat", "Liz"]
let channelOutNotes: number[] = [0, 1, 2, 3]
let noteFreq: number[] = [131, 139, 147, 156, 165, 175, 185, 196, 208, 220, 233, 247, 262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494, 523, 555, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988]
let outPutToTrigger = 0
let bWasPressed = false
let aWasPressed = false
let stepToWrite = 0 //stores the step we actually want to write a note to (could be the next step if we pressed just a little too early)
let earlyTrigger = false //a flag to tell the note player not to play note on buttonpress if it was pressed just before a step
let isMasterClock = false
let metronome = false
let allowBlipsAndBloops = false //make blips and bloops in the sequencer
let thumperIsMuted = false
let waiting = false
let nextClockTickTime = 0
let globalPinOnTime = 16;
///
////
////
let runningInSimulator = true
if (pins.digitalReadPin(DigitalPin.P20)) {
    runningInSimulator = false
}


/// receiver stuff
//let onTimer = 0



enum myTouchPins{
    //%block="p0"
    p0 = 7,
    //%block="p1"
    p1 = 8,
    //%block="p2"
    p2 = 9
}

enum timeSlotModes {
    //%block="legacy"
    legacy = 0,
    //%block="stagger 1 int at a time"
    stagger = 1,
    //%block="allow 2 addressed ints"
    allow_2_int = 2,
    //%block="allow 3 addressed ints"
    allow_3_int = 3,
    //%block="allow 4 adressed ints"
    allow_4_int = 4
}

enum thumperType {
    //%block="without speaker"
    withoutSpeaker = 0,
    //%block="with speaker"
    withSpeaker = 1,
}

enum internalExternal {
    //%block="external_clock"
    external_clock = 1,
    //%block="internal_clock"
    internal_clock = 0,
    //%block="autorun_in_simulator"
    autorun_in_simulator = 2,
    //%block="internal_until_clock_received"
    internal_until_clock_received = 3
}

enum allowBlipsNoYes {
    //%block="no_thanks"
    no_thanks = 0,
    //%block="yes_please"
    yes_please = 1
}

enum metronomeNoYes {
    //%block="no_thanks"
    no_thanks = 0,
    //%block="yes_please"
    yes_please = 1
}

enum onOff {
    //%block="on"
    on = 1,
    //%block="off"
    off = 0
}

enum bunSolactions {
    //%block="(0) tok"
    tok = 0,
    //%block="(1) todok"
    todok = 1,
    //%block="(2) brrrrp"
    brrrp = 2,
    //%block="(3) skrrr"
    skrrr = 3,
    //%block="auto"
    auto = 4
}

enum numberofSteps {

    //%block="four"
    four = 4,
    //%block="eight"
    eight = 8,
    //%block="sixteen"
    sixteen = 16,
    //%block="thirty two"
    thirty_two = 32
}

enum subDiv {

    //%block="1/1"
    bar = 0,
    //%block="1/2"
    half = 1,
    //%block="1/4"
    fourth = 2,
    //%block="1/8"
    eighth = 3,
    //%block="1/16"
    sixteenth = 4
}

enum channels {
    //%block="one"
    one = 0,
    //%block="two"
    two = 1,
    //%block="three"
    three = 2,
    //%block="four"
    four = 3
}

enum mOrS {
    //%block="mute"
    mute = 0,
    //%block="solo"
    solo = 1
}

enum brightnesses {
    //%block="ow_my_eyes"
    ow_my_eyes = 255,
    //%block="bright"
    bright = 100,
    //%block="a_little_less_bright"
    a_little_less_bright = 50,
    //%block="not_so_bright"
    not_so_bright = 25,
    //%block="a_bit_faint"
    a_bit_faint = 10,
    //%block="default"
    normal = 0,
    //%block="barely_visible"
    barely_visible = 1
}

enum beepsOnOff {
    //%block="off"
    off = 0,
    //%block="on"
    on = 1

}





let conductorUnlocked = false

/**
 * Custom blocks
 */
//% weight=100 color=#01bc11 icon=""
//%blockId="OrchestraConductor" block="Orchestra Conductors"
namespace OrchestraConductor {
    /**
     * unlock conductor blocks
     */
    //% blockId="MBORCH_conductorPassword" block="unlock conductor blocks with password = ´$password" advanced=true
    export function enterConductorPassword(password: number) {
        enteredPassword = password
        if (password == conductorPassword) {
            conductorUnlocked = true
        } else {
            basic.showString("wrong password")
        }
    }

    /**
     * mute a musician
     */
    //% block advanced=true
    //% blockId="MBORCH_muteMusician" block="mute musician number %musicianNumber" advanced=true
    export function muteMusician(musicianNumber: number) {
        if (conductorUnlocked) {
            radio.setGroup(84)
            radio.sendValue("mm", musicianNumber)
        } else {
            basic.showString("wrong password")
        }

    }
    /**
     * unmute a musician
     */
    //% block advanced=true
    //% blockId="MBORCH_unMuteMusician" block="unmute musician number %musicianNumber"
    export function unMuteMusician(musicianNumber: number) {
        if (conductorUnlocked) {
            radio.setGroup(84)
            radio.sendValue("mum", musicianNumber)
        } else {
            basic.showString("wrong password")
        }
    }


    /**
 * solo a musician
 */
    //% block advanced=true
    //% blockId="MBORCH_soloMusician" block="solo musician number %musicianNumber"

    export function soloMusician(musicianNumber: number) {
        if (conductorUnlocked) {
            radio.setGroup(84)
            radio.sendValue("ms", musicianNumber)
        } else {
            basic.showString("wrong password")
        }
    }

    /**
* mute all musicians
*/
    //% block advanced=true
    //% blockId="MBORCH_muteAllMusicians" block="mute all musicians"
    export function muteAllMusicians() {
        if (conductorUnlocked) {
            radio.setGroup(84)
            radio.sendValue("mm", 1337)
        } else {
            basic.showString("wrong password")
        }
    }

    /**
* unmute all musicians
*/
    //% block advanced=true
    //% blockId="MBORCH_unMuteAllMusicians" block="unmute all musicians "
    export function unMuteAllMusicians() {
        if (conductorUnlocked) {
            radio.setGroup(84)
            radio.sendValue("ms", 1337) //it actually solos all musicians
        } else {
            basic.showString("wrong password")
        }
    }

    /**
         * Retrigger the master clock back to 0
         */
    //% block advanced=true
    //% blockId="MBORCH_resetMasterSync" "block=reset the master clock back to zero"
    export function resetMasterClockSync() {
        if (conductorUnlocked) {
            lastClockTickTime = 0
            masterClockStep = -1
            runMasterClock()
        } else {
            basic.showString("wrong password")
        }
    }

    /**
         * Retrigger the master clock back to 0
         */
    //% block advanced=true
    //% blockId="MBORCH-thumpOnOff" "turn thumps on or off"
    export function turnThump(onOff: onOff) {
    OrchestraMusician.send(onOff, "thump")
    }

    /**
     * Setup this microbit as the master clock
     */
    //% blockId="MBORCH_setupAsMAsterClock" block="Make master clock with| steps $NumberOfSteps BPM $bpm subdivision of $subDivision Metronome beeps $MetronomeBeeps|(this block is locked by password)" advanced=true bpm.defl=60 bpm.min=10 bpm.max=400
    export function setUpAsMasterClock(NumberOfSteps: numberofSteps, bpm: number, subDivision: subDiv, MetronomeBeeps: beepsOnOff) {
        if (conductorUnlocked) {
            radio.setGroup(84)
            extClock = 0
            masterTempo = bpm
            stepLengthms = 60000 / bpm
            stepLengthms = stepLengthms >> subDivision
            isMasterClock = true
            seqLength = NumberOfSteps
            masterClockStep = -1
            lastStep = seqLength
            if (MetronomeBeeps > 0) {
                metronome = true
            } else {
                metronome = false
            }
            control.inBackground(() => {
                while (true) {
                    runMasterClock()
                    basic.pause(1)
                }
            })
            nextClockTickTime = input.runningTime() + stepLengthms
        } else {
            basic.showString("wrong password")
        }
    }
}
function runMasterClock(): void {
    if (isMasterClock) {
        //make sure master clock is setup
        if (input.runningTime() >= nextClockTickTime) {
            //let differance = input.runningTime() - nextClockTickTime
            lastClockTickTime = nextClockTickTime
            nextClockTickTime = lastClockTickTime + stepLengthms
            //lastClockTickTime = input.runningTime()// - differance
            lastStep = masterClockStep
            masterClockStep += 1
            masterClockStep = masterClockStep % seqLength

            radio.setGroup(84)
            radio.sendValue("t", masterClockStep)

            handleMasterClockDisplay(masterClockStep, lastStep)
            if (metronome) {
                if (masterClockStep > 0) {
                    music.playTone(440, 20)
                } else {
                    music.playTone(880, 20)
                }

            }
        }
        led.setBrightness(led.brightness() - 3)
    }
}



function handleMasterClockDisplay(thisStepIs: number, previousStepWas: number) {
    //basic.showNumber(thisStepIs + 1, 0)
    let Nvalue = thisStepIs// + 1
    if (Nvalue == 200) {
        basic.showLeds(`
                # # # # #
                # # # # #
                # # # # #
                # # # # #
                # # # # #
                `, 0)
    } else if (Nvalue % 16 == 0) {
        basic.showLeds(`
                . . # . .
                . . # . .
                . . # . .
                . . # . .
                . . # . .
                `, 0)
    } else if (Nvalue % 16 == 1) {
        basic.showLeds(`
                . # # # .
                . . . # .
                . # # # .
                . # . . .
                . # # # .
                `, 0)
    } else if (Nvalue % 16 == 2) {
        basic.showLeds(`
                . # # # .
                . . . # .
                . . # # .
                . . . # .
                . # # # .
                `, 0)
    } else if (Nvalue % 16 == 3) {
        basic.showLeds(`
                . # . # .
                . # . # .
                . # # # .
                . . . # .
                . . . # .
                `, 0)
    } else if (Nvalue % 16 == 4) {
        basic.showLeds(`
                . # # # .
                . # . . .
                . # # # .
                . . . # .
                . # # # .
                `, 0)
    } else if (Nvalue % 16 == 5) {
        basic.showLeds(`
                . # . . .
                . # . . .
                . # # # .
                . # . # .
                . # # # .
                `, 0)
    } else if (Nvalue % 16 == 6) {
        basic.showLeds(`
                . # # # .
                . . . # .
                . . . # .
                . . . # .
                . . . # .
                `, 0)
    } else if (Nvalue % 16 == 7) {
        basic.showLeds(`
                . # # # .
                . # . # .
                . # # # .
                . # . # .
                . # # # .
                `, 0)
    } else if (Nvalue % 16 == 8) {
        basic.showLeds(`
                . # # # .
                . # . # .
                . # # # .
                . . . # .
                . . . # .
                `, 0)
    } else if (Nvalue % 16 == 9) {
        basic.showLeds(`
                # . # # #
                # . # . #
                # . # . #
                # . # . #
                # . # # #
                `, 0)
    } else if (Nvalue % 16 == 10) {
        basic.showLeds(`
                . # . # .
                . # . # .
                . # . # .
                . # . # .
                . # . # .
                `, 0)
    } else if (Nvalue % 16 == 11) {
        basic.showLeds(`
                # . # # #
                # . . . #
                # . # # #
                # . # . .
                # . # # #
                `, 0)
    } else if (Nvalue % 16 == 12) {
        basic.showLeds(`
                # . # # #
                # . . . #
                # . . # #
                # . . . #
                # . # # #
                `, 0)
    } else if (Nvalue % 16 == 13) {
        basic.showLeds(`
                # . # . #
                # . # . #
                # . # # #
                # . . . #
                # . . . #
                `, 0)
    } else if (Nvalue % 16 == 14) {
        basic.showLeds(`
                # . # # #
                # . # . .
                # . # # #
                # . . . #
                # . # # #
                `, 0)
    } else if (Nvalue % 16 == 15) {
        basic.showLeds(`
                # . # . .
                # . # . .
                # . # # #
                # . # . #
                # . # # #
                `, 0)
    } else if (Nvalue == 33) {
        basic.showLeds(`
                # . # # #
                # . . . #
                # . . . #
                # . . . #
                # . . . #
                `, 0)
    } else {

        basic.showLeds(`
                # # # # #
                # # # # #
                # # # # #
                # # # # #
                # # # # #
                `, 0)
    }
    led.setBrightness(255)

}