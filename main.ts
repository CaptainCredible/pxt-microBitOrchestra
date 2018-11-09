

let timeSlotSpacing = 1  //spacing in milliseconds 
let buttonScanSpeed = 10
let oldButtA = false
let oldButtB = false
let musicianIsMuted = false
let ABWasPressed = false
let ABtimer = 0
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
///
////
////
let runningInSimulator = true
if (pins.digitalReadPin(DigitalPin.P20)) {
    runningInSimulator = false
}


/// receiver stuff
//let onTimer = 0





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


/**
 * Custom blocks
 */
//% weight=100 color=#01bc11 icon=""
//%blockId="OrchestraInstrument" block="Orchestra Instruments"
namespace OrchestraInstrument {

    /**
     * Setup your micro:bit as an Instrument
     * @param withNam a unique name that the Musicians can shout to get your Instruments attention
     */
    //% blockId="MBORCH_joinAsInstrument" block="make an amazing instrument with the name %withName"
    export function JoinOrchestraAsInstrument(withName: string): void {
        radio.setGroup(83)
        isInstrument = true
        InstrumentName = withName
        radio.onDataPacketReceived(({ receivedString: receivedName, receivedNumber: value }) => {
            led.toggle(2, 2)
            // here we need to distinguish between normal and Poly
            if (receivedName == InstrumentName) {
                if (outputMode == 0) { // no automated trigger handling
                    control.raiseEvent(1337, value + 1) //we need to avoid zero, zero is catch all
                } else {
                    handleInstrumentOutputMode(value) //decide what to do
                }
            }
            else if (receivedName == InstrumentName + "P") {
                handleInstrumentPoly(value) //decide what to do
            }
        })
        control.inBackground(() => {
            while (true) {
                handleInstrumentOffs()
                basic.pause(10)
            }
        })
    }

    //%blockId="MBORCH_redirectNotesToPulsePins" block="use incoming notes 1-8 to pulse pins one %one|two %two|three %three|four %four|five %five|six %six|seven %seven|eight %eight"
    export function redirectNotesToPulsePins(one: DigitalPin, two: DigitalPin, three: DigitalPin, four: DigitalPin, five: DigitalPin, six: DigitalPin, seven: DigitalPin, eight: DigitalPin): void {
        outputMode = 1
        pinOutputRoutings[0] = one
        pinOutputRoutings[1] = two
        pinOutputRoutings[2] = three
        pinOutputRoutings[3] = four
        pinOutputRoutings[4] = five
        pinOutputRoutings[5] = six
        pinOutputRoutings[6] = seven
        pinOutputRoutings[7] = eight
    }


    function handleInstrumentOutputMode(noteToHandle: number) {  //this needs to be set up as a function that can be populated in block editor
        if (outputMode > 0) {
            switch (outputMode) {
                case 1: { // redirectNotesToPulsePins
                    triggerPinOutput(noteToHandle)
                    break;
                }
                case 2: { //redirectNotesToMCP23017
                    triggerMCP23017(noteToHandle)
                    break;
                }
            }
        }
        //put a switch case here to select how to handle the outputs, MCP32017 or hardwarepins or 

        if (noteToHandle < 25) {  //put this in an own plot to led function
            let column = noteToHandle / 5
            let row = noteToHandle % 5
            led.toggle(column, row)
        }
    }

    function handleInstrumentPoly(dataToHandle: number) {  //this needs to be set up as a function that can be populated in block editor
        let noteToHandle = 0 // parse bits here!! 
        let bitCheckMask = 1
        for (let i = 0; i <= 16; i++) {
            if (bitCheckMask & dataToHandle) {
                noteToHandle = i
            }
            handleInstrumentOutputMode(noteToHandle)
        }

        if (outputMode > 0) {

            switch (outputMode) {
                case 1: { // redirectNotesToPulsePins
                    triggerPinOutput(noteToHandle)
                    break;
                }
                case 2: { //redirectNotesToMCP23017
                    triggerMCP23017(noteToHandle)
                    break;
                }
            }
        }
        //put a switch case here to select how to handle the outputs, MCP32017 or hardwarepins or 

        if (noteToHandle < 25) {  //put this in an own plot to led function
            let column = noteToHandle / 5
            let row = noteToHandle % 5
            led.toggle(column, row)
        }
    }

    function triggerMCP23017(MCPOutputToTrigger: number) {
        //TODO
    }



    function triggerPinOutput(PINoutputToTrigger: number) {
        onTimer[PINoutputToTrigger] = input.runningTime()
        outputIsOn[PINoutputToTrigger] = true
        pins.digitalWritePin(pinOutputRoutings[PINoutputToTrigger], 1)
    }

    function unTriggerPinOutput(PINoutputToUnTrigger: number) {

        onTimer[PINoutputToUnTrigger] = input.runningTime()
        outputIsOn[PINoutputToUnTrigger] = false
        pins.digitalWritePin(pinOutputRoutings[PINoutputToUnTrigger], 0)
    }




    function handleInstrumentOffs(): void {
        for (let i = 0; i < numberOfOutputs; i++) {
            if (outputIsOn[i]) {
                if (input.runningTime() - onTimer[i] > 10) {
                    switch (outputMode) {
                        case 0: { //no automatic Handling of this stuff
                            break;
                        }
                        case 1: { // outputs go to pins, we need to turn them off
                            unTriggerPinOutput(i)
                            break;
                        }
                        case 2: { //ouputs go to MCP23017, we need to turn them off
                            //TODO make an untriggermcp23017() that can be called

                            break;
                        }
                        case 3: { //MIDI out ?

                            break;
                        }
                    }
                    basic.clearScreen()
                }
            }
        }
    }




	/**
     * Registers code to run when the Instrument receives a perticular note.
     */


    //%block="when instrument receives note number| %note"
    export function onInstrumentReceivedNote(note: number, body: () => void) {
        outputMode = 0
        //onTimer[note] = input.runningTime()
        //outputIsOn[note] = true
        //led.toggleAll()
        control.onEvent(1337, note + 1, body);
    }



    /**
     * Make a Thumper, a device that listens for one specific radio message and triggers one actuator on P0
     * @param Name
     * @param Number
     */
    //% blockId="MBORCH_Thumper" block="make a thumper with the name %Name"
    export function makeAThumper(Name: string): void {


        radio.setGroup(83)
        radio.onDataPacketReceived(({ receivedString: receivedName, receivedNumber: value }) => {
            if (receivedName == "m") {
                /*
                Bob 00000001
                Tim 00000010
                Ted 00000100
                Pat 00001000
                Cat 00010000 (also thumper)
                Dad 00100000
                Mum 01000000
                Zim 10000000
                */


                if (value & 0b00010000) {
                    thumperIsMuted = true
                    basic.showIcon(IconNames.No, 1)
                    //basic.pause(1000)
                } else {
                    thumperIsMuted = false
                    basic.clearScreen()
                }
            }
            if (!thumperIsMuted) {
                if (receivedName == Name) {
                    pins.digitalWritePin(DigitalPin.P0, 1)
                    led.toggle(2, 2)
                    basic.pause(2)
                    pins.digitalWritePin(DigitalPin.P0, 0)
                    led.toggle(2, 2)
                } else if (receivedName == Name + "P") {
                    //let polyPMatch = 1 << (Number)
                    //if (polyPMatch & value) {
                    pins.digitalWritePin(DigitalPin.P0, 1)
                    led.toggle(2, 3)
                    basic.pause(5)
                    pins.digitalWritePin(DigitalPin.P0, 0)
                    led.toggle(2, 3)
                    //}
                }
            }

        })
        basic.showString(Name, 40)
        //basic.showNumber(Number, 40)
        basic.pause(200)
        basic.clearScreen()
        if (thumperIsMuted) {
            basic.showIcon(IconNames.No, 1)

        }
    }



    /**
 * Make a Grouped Thumper, a device that listens for one specific radio message and triggers one actuator on P0
 * @param Name
 * @param Number
 */
    //% block advanced=true
    //% blockId="MBORCH_groupedThumper" block="make a grouped thumper with the number %Number in the group %groupName" weight=100
    export function makeAGroupedThumper(GroupName: string, Number: number): void {
        radio.setGroup(83)
        radio.onDataPacketReceived(({ receivedString: receivedName, receivedNumber: value }) => {
            if (receivedName == "m") {
                /*
                Bob 00000001
                Tim 00000010
                Ted 00000100
                Pat 00001000
                Cat 00010000 (also thumper)
                Dad 00100000
                Mum 01000000
                Zim 10000000
                */
                if (value & 0b00010000) {
                    thumperIsMuted = true
                    basic.showIcon(IconNames.No, 1)
                } else {
                    thumperIsMuted = false
                    basic.clearScreen()
                }
            }
            if (!thumperIsMuted) {
                if (receivedName == GroupName && value == Number) {
                    pins.digitalWritePin(DigitalPin.P0, 1)
                    led.toggle(2, 2)
                    basic.pause(2)
                    pins.digitalWritePin(DigitalPin.P0, 0)
                    led.toggle(2, 2)
                } else if (receivedName == GroupName + "P") {
                    let polyPMatch = 1 << (Number)
                    if (polyPMatch & value) {
                        pins.digitalWritePin(DigitalPin.P0, 1)
                        led.toggle(2, 3)
                        basic.pause(5)
                        pins.digitalWritePin(DigitalPin.P0, 0)
                        led.toggle(2, 3)
                    }
                }

            }
        })
        basic.showString(GroupName, 40)
        basic.showNumber(Number, 40)
        basic.pause(200)
        basic.clearScreen()
    }
    export function playBassDrumThroughSpeaker() {
        let l = 200
        for (let i = 0; i <= l - 1; i++) {
            music.playTone(l * 2 - i * 2, 0)
        }
        music.playTone(440, 1)
    }
    export function playSnareDrumThroughSpeaker() {
        let m = 200
        for (let i0 = 0; i0 < m; i0++) {
            music.playTone(Math.randomRange(1000, 4000), 0)
        }
        music.playTone(440, 1)
    }


}


/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon=""
//%blockId="OrchestraMusician" block="Orchestra Musicians"
namespace OrchestraMusician {

    /**
     * Registers code to run when button A is pushed
     */


    //%block="as soon as button A is pushed" weight=80
    //%color=#D400D4 weight=70
    export function onButtonAPressed(thing: Action) {
        control.inBackground(function () {
            while (true) {
                if (input.buttonIsPressed(Button.A) && !aWasPressed) {
                    control.raiseEvent(1983, 10)
                    aWasPressed = true
                } else if (!input.buttonIsPressed(Button.A)) {
                    aWasPressed = false
                }
                basic.pause(buttonScanSpeed)
            }
        })
        control.onEvent(1983, 10, thing);
    }

    /**
     * Registers code to run when button B is pushed
     */


    //%block="as soon as button B is pushed" 
    //%color=#D400D4 weight=70
    export function onButtonBPressed(thing: () => void) {
        control.inBackground(function () {
            while (true) {
                if (input.buttonIsPressed(Button.B) && !bWasPressed) {
                    control.raiseEvent(1984, 10)
                    bWasPressed = true
                } else if (!input.buttonIsPressed(Button.B)) {
                    bWasPressed = false
                }
                basic.pause(buttonScanSpeed)
            }
        })
        control.onEvent(1984, 10, thing);
    }


    /**
     * inserts a pause to wait for tick
     */

    //% blockId="MBORCH_waitForStep" block="wait for step number %step" weight=90
    export function waitFor(step: number) {
        extClock = 1
        waiting = true
        while (waiting) {
            basic.pause(1)
            if (currentStep == step)
                waiting = false
        }
    }








    /**
     * Setup the routing of the 4 sequencer tracks
     */
    //% advanced=true
    //% blockId="MBORCH_setupTrackRouting" block="track %channels|sends name %Name| and number %note"
    //%advanced = true 
    export function setUpTrackRouting(channel: channels, Name: string, note: number) {
        channelIsSetup[channel] = true
        channelOutNames[channel] = Name
        channelOutNotes[channel] = note
    }

    /**
     * Run the sequencer clock 
     */
    //% advanced=true
    //% blockId="MBORCH_runSequencer" block="run sequencer and check buttons"
    export function runSequencer() {
        if (sequencerExists) {
            if (extClock == 0) {
                clockTimer()
            }
            pulseSelectLed()
            checkButts() //replace this with discrete functions
        }
    }

    let selectLedBrightness = 255
    let selectLedGoingUp = false
    function pulseSelectLed() {
        if (selectLedGoingUp) {
            selectLedBrightness += 10
            if (selectLedBrightness > 253) {
                selectLedGoingUp = false
            }
        } else {
            selectLedBrightness -= 10
            if (selectLedBrightness < 10) {
                selectLedGoingUp = true
            }
        }
        led.plotBrightness(4, channelSelect, selectLedBrightness)
    }
    function changeSelectedChannel(by: number) {
        led.unplot(4, channelSelect)
        channelSelect = channelSelect + by
        while (channelSelect < 0) {
            channelSelect = channelSelect + 400
        }
        channelSelect = channelSelect % 4
        // serial.writeNumber(channelSelect)
        led.plot(4, channelSelect)
    }


    function checkButts() {
        // BUTTON A
        if (input.buttonIsPressed(Button.A) && !(aWasPressed)) {
            aWasPressed = true
            led.unplot(4, channelSelect)
            channelSelect += 1
            channelSelect = channelSelect % 4
            led.plot(4, channelSelect)
        } else if (!(input.buttonIsPressed(Button.A)) && aWasPressed) {
            aWasPressed = false
        }
        // BUTTON B
        if (input.buttonIsPressed(Button.B) && !(bWasPressed)) {
            bWasPressed = true
            if (input.runningTime() - lastClockTickTime > (stepLengthms >> 2) * 3) {
                stepToWrite = (currentStep + 1) % seqLength
                earlyTrigger = true
            } else {
                stepToWrite = currentStep
                earlyTrigger = false
            }
            if (channelSelect == 0) {
                seqA[stepToWrite] = true
            } else if (channelSelect == 1) {
                seqB[stepToWrite] = true
            } else if (channelSelect == 2) {
                seqC[stepToWrite] = true
            } else if (channelSelect == 3) {
                seqD[stepToWrite] = true
            }
            triggerBuffer[channelSelect] = true
            if (!earlyTrigger) { //only handle tones if the button was pressed after the cursor got to the step we are writing to
                if (allowBlipsAndBloops) {
                    handleTones()
                }

                if (channelIsSetup[channelSelect] && microBitID != 9876) {   //check that we have set up this channel and that we have set a microbit ID
                    send(channelOutNotes[channelSelect], channelOutNames[channelSelect])
                }
            }
            clearTriggerBuffer()
            updatePage()
        } else if (!(input.buttonIsPressed(Button.B)) && bWasPressed) {
            bWasPressed = false
        }
        // BOTH
        if (input.buttonIsPressed(Button.AB)) {
            if (!ABWasPressed) {
                ABtimer = input.runningTime() + 1000
            } else {
                if (input.runningTime() > ABtimer) {
                    for (let index = 0; index <= seqLength; index++) {
                        seqA[index] = false
                        seqB[index] = false
                        seqC[index] = false
                        seqD[index] = false
                    }
                    updatePage()
                }
            }
            ABWasPressed = true
        } else {
            ABWasPressed = false
        }
    }



    function triggerChannel(channelToTrigger: number) {
        if (channelIsSetup[channelToTrigger]) {
            //basic.pause(microBitID) //wait for this microbits timeslot to avoid radios talking ontop of eachother
            send(channelOutNotes[channelToTrigger], channelOutNames[channelToTrigger])
        }
    }






    function sendTriggersOut() {  //read the buffer and send any notes that need to be sent
        for (let m = 0; m <= 4 - 1; m++) {
            if (triggerBuffer[m]) {
                triggerChannel(m)
                //radio.sendValue("on", m + deviceID * 4)
            }
        }
    }

    function clearTriggerBuffer() {
        for (let outputToClear = 0; outputToClear <= 4 - 1; outputToClear++) {
            triggerBuffer[outputToClear] = false
        }
    }
    ///
    function handleTones() {
        if (!musicianIsMuted) {
            music.setTempo(masterTempo)
            if (triggerBuffer[0]) {
                music.playTone(523, music.beat(BeatFraction.Sixteenth))
                //serial.writeLine("0")
            }
            if (triggerBuffer[1]) {
                music.playTone(392, music.beat(BeatFraction.Sixteenth))
                //serial.writeLine("1")
            }
            if (triggerBuffer[2]) {
                music.playTone(330, music.beat(BeatFraction.Sixteenth))
                //serial.writeLine("2")
            }
            if (triggerBuffer[3]) {
                music.playTone(262, music.beat(BeatFraction.Sixteenth))
                //serial.writeLine("3")
            }
        }
    }


    function handleNoteOffs() {
        //TODO
    }

    let cursorBrightness = 5



    /**
     * Set the brightness of the cursor
     * @param With how many steps
     * @param stepsAndUse internal or external clock
     */
    //% block advanced=true
    //% blockId="MBORCH_setBrightness" block="set the brightness of the sequencer cursor to %to"
    export function setCursorBrightnes(to: brightnesses): void {
        cursorBrightness = to
    }


    function handleSeqCursor() {
        ledCursor = currentStep % 4
        offLed = ledCursor - 1
        if (offLed < 0) {
            offLed = 3
        }
        updatePage()
        //led.unplot(offLed, 4)
        if (seqLength <= 8) {
            handle2PartDisplay()
        } else {
            handle4PartDisplay()
        }
        //led.plot(ledCursor, 4)
        for (let num = 0; num <= 3; num++) {
            if (!led.point(ledCursor, num)) {
                led.plotBrightness(ledCursor, num, cursorBrightness)
            }

        }
    }


    function handle2PartDisplay() {
        led.unplot(offLed, 4)
        led.plot(ledCursor, 4)
        part = currentStep >> 2
        if (part < 1) {
            led.unplot(4, 4)
        } else {
            led.plot(4, 4)
        }
        // check if we are at a new part
        if (part != oldPart) {
            updatePage()
            oldPart = part
        }
    }
    /////////////////////////////////////////
    let partLed = 0
    function handle4PartDisplay() { //can actually handle up to 8 parts

        //handle2PartDisplay()
        part = currentStep >> 2
        if (part > 3) { // we are over 4 parts
            led.plot(4, 4)
            partLed = part - 4
        } else {
            led.unplot(4, 4)
            partLed = part
        }

        for (let o = 0; o <= 4 - 1; o++) {
            led.unplot(o, 4)
        }
        if (part != oldPart) {
            updatePage()
            oldPart = part
        }
        led.plot(partLed, 4)
    }

    function handle8partDisplay() {
        //TODO (a combination of 2part and 4part)
    }

    function handleStep() {
        handleSeqCursor()
        if (seqA[currentStep]) {
            triggerBuffer[0] = true
        }
        if (seqB[currentStep]) {
            triggerBuffer[1] = true
        }
        if (seqC[currentStep]) {
            triggerBuffer[2] = true
        }
        if (seqD[currentStep]) {
            triggerBuffer[3] = true
        }
        sendTriggersOut()

        if (allowBlipsAndBloops) {
            handleTones()
            // serial.writeLine("AllowBlipsAndBloops")
        }
        if (metronome == true) {
            music.playTone(880, 2)
            // serial.writeLine("metronome")
        }

        clearTriggerBuffer()
    }

    function handleLastStep() {
        if (seqA[lastStep]) {
            outPutToTrigger = 0
            handleNoteOffs()
        }
        if (seqB[lastStep]) {
            outPutToTrigger = 1
            handleNoteOffs()
        }
        if (seqC[lastStep]) {
            outPutToTrigger = 2
            handleNoteOffs()
        }
        if (seqD[lastStep]) {
            outPutToTrigger = 3
            handleNoteOffs()
        }
    }





    /**
     * Setup an advanced sequencer
     * @param With how many steps
     * @param stepsAndUse internal or external clock
     */
    //% block advanced=true
    //% blockId="MBORCH_makeAnAdvancedSequencer" block="make a really advanced sequencer:|number of steps %NumberOfSteps clock %Clock tempo %Tempo metronome clicks %Metronome make sounds for the notes sent %blipsAndBloops" weight=100
    //% Tempo.min=40 Tempo.max=400
    //% Tempo.defl=120
    export function makeAnAdvancedSequencer(NumberOfSteps: numberofSteps, Clock: internalExternal, Tempo: number = 120, Metronome: metronomeNoYes, blipsAndBloops: allowBlipsNoYes): void {
        stepLengthms = 60000 / Tempo //find duration of 1bar
        stepLengthms = stepLengthms >> 1 //find duration of 1 2th
        if (Metronome == 1) {
            metronome = true
        } else {
            metronome = false
        }
        if (blipsAndBloops == 1) {
            allowBlipsAndBloops = true
        } else {
            allowBlipsAndBloops = false
        }
        seqLength = NumberOfSteps
        lastStep = seqLength
        if (Clock == 3) {
            Clock = 0
            auto = true
        } else if (Clock == 2) { //if only run in simulator
            if (runningInSimulator) {
                extClock = 0
            } else {
                extClock = 1
            }
        } else {
            extClock = Clock
            auto = false
        }


        if (extClock) {
            masterTempo = 480
        }
        sequencerExists = true
        input.onShake(() => {
            for (let i = 0; i <= seqLength; i++) {
                if (channelSelect == 0) {
                    seqA[i] = false
                } else if (channelSelect == 1) {
                    seqB[i] = false
                } else if (channelSelect == 2) {
                    seqC[i] = false
                } else if (channelSelect == 3) {
                    seqD[i] = false
                }
            }
            updatePage()
        })
    }

    /**
         * Setup a simple sequencer
         * @param With how many steps
         * @param stepsAndUse internal or external clock
         */
    //% blockId="MBORCH_makeASimpleSeequencer" block="make a sequencer:|number of steps %NumberOfSteps|track 1 sends name %name1 and number %note1|track 2 sends name %name2 and number %note2|track 3 sends name %name3 and number %note3|track 4 sends name %name4 and number %note4"
    export function makeASequencer(NumberOfSteps: numberofSteps, name1: string, note1: number, name2: string, note2: number, name3: string, note3: number, name4: string, note4: number): void {
        makeAnAdvancedSequencer(NumberOfSteps, internalExternal.autorun_in_simulator, 40, metronomeNoYes.yes_please, allowBlipsNoYes.yes_please)

        setUpTrackRouting(channels.one, name1, note1)
        setUpTrackRouting(channels.two, name2, note2)
        setUpTrackRouting(channels.three, name3, note3)
        setUpTrackRouting(channels.four, name4, note4)
        control.inBackground(function () {
            while (true) {
                basic.pause(20)
                runSequencer()
            }
        })
    }


    function handleMusicianMutes(musicianToMute: number, muteOrUnMute: boolean) {
        if ((musicianToMute == microBitID) || (musicianToMute == 1337)) { //if we are being asked to mute
            if (muteOrUnMute) {
                musicianIsMuted = true
                basic.showIcon(IconNames.No, 0)
            } else {
                musicianIsMuted = false
                basic.clearScreen()
                if (sequencerExists) {
                    updatePage()
                }
            }

        }
    }

    function handleMusicianSolos(musicianToSolo: number) {
        if ((musicianToSolo == microBitID) || (musicianToSolo == 1337)) {
            musicianIsMuted = false
            basic.clearScreen()
            if (sequencerExists) {
                updatePage()
            }
        } else {
            musicianIsMuted = true
            basic.showIcon(IconNames.No, 0)
        }
    }




    /**
     * Setup your micro:bit as a Musician
     * @param withId a unique ID so your Musician knows where to stand (and also so the Musicians don't talk at the same time)
     */
    //% blockId="MBORCH_setUpAsMusician" block="join orchestra as musician with ID %withID" weight=100
    export function setUpAsMusician(withID: number): void {
        radio.setGroup(84) // tempo and clock ticks will be sent on radio group 84
        microBitID = withID
        isInstrument = false
        radio.onDataPacketReceived(({ receivedString: msgID, receivedNumber: receivedData }) => {
            if (auto) {
                extClock = 1
                auto = false
            }

            if (extClock) {
                handleExtClock(msgID, receivedData)
            }
            if (msgID == "mm") { //mm = musicianMutes
                handleMusicianMutes(receivedData, true)
            } else if (msgID == "ms") { //musician solo
                handleMusicianSolos(receivedData)
            } else if (msgID == "ma") { //mute all
                handleMusicianMutes(1337, true) // this will mute all
            } else if (msgID == "uma") {//this will unmute all
                handleMusicianSolos(1337)
            } else if (msgID == "mum") {//this will unmute one
                handleMusicianMutes(receivedData, false)
            }
        })
        basic.showNumber(microBitID, 0)

    }

    /**
     * Send a command to the Microbit Orchestra
     */
    //%blockId="MBORCH_sendNote" block="send note number %note| to %to" weight=60
    export function send(note: number, to: string) {
        if (!musicianIsMuted) {
            basic.pause(microBitID * timeSlotSpacing) //safer pause
            radio.setGroup(83) // change to the group where the Instruments are
            radio.sendValue(to, note)
            radio.setGroup(84) // change back to the group where tempo and clock ticks are
        } else {
            basic.showIcon(IconNames.No, 0)
        }

    }




    ////////////////////////////////////////

    let pageOffset = 0
    function updatePage() {
        if (musicianIsMuted) {
            basic.showIcon(IconNames.No)
        } else {
            actuallyUpdatePage()
        }
    }
    function actuallyUpdatePage() {
        pageOffset = part * 4
        for (let j = 0; j <= 4 - 1; j++) {
            if (seqA[j + pageOffset]) {
                led.plot(j, 0)
            } else {
                led.unplot(j, 0)
            }
        }
        for (let k = 0; k <= 4 - 1; k++) {
            if (seqB[k + pageOffset]) {
                led.plot(k, 1)
            } else {
                led.unplot(k, 1)
            }
        }
        for (let l = 0; l <= 4 - 1; l++) {
            if (seqC[l + pageOffset]) {
                led.plot(l, 2)
            } else {
                led.unplot(l, 2)
            }
        }
        for (let n = 0; n <= 4 - 1; n++) {
            if (seqD[n + pageOffset]) {
                led.plot(n, 3)
            } else {
                led.unplot(n, 3)
            }
        }
    }
    ///////////////////////////////////////

    function clockTimer() {
        // comment
        if (input.runningTime() >= lastClockTickTime + stepLengthms) {
            lastStep = currentStep
            lastClockTickTime = input.runningTime()
            currentStep += 1
            //led.toggle(4, channelSelect)
            currentStep = currentStep % seqLength
            //handleLastStep()
            handleStep()
        }
    }

    function handleExtClock(tickType: string, receivedData: number) {
        if (tickType == "t") {
            currentStep = receivedData + 1
            stepLengthms = input.runningTime() - lastClockTickTime
            if (sequencerExists) { //HERE
                manuallyStepSequence()
            }
        }
    }

    function manuallyStepSequence() {
        //lastStep = currentStep
        if (extClock) {
            currentStep -= 1 // we need to translate current step from 1234 to 0123 for the sequencer to work properly
        } else {
            currentStep += 1
        }
        lastClockTickTime = input.runningTime()
        led.toggle(4, channelSelect)
        currentStep = currentStep % seqLength
        //handleLastStep() OLD NOTEOFF CRAP
        handleStep()
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


/**
 * Custom blocks
 */
//% weight=100 color=#01bc11 icon=""
//%blockId="OrchestraConductor" block="Orchestra Conductors"
namespace OrchestraConductor {
    /**
     * mute a musician
     */
    //% block advanced=true
    //% blockId="MBORCH_muteMusician" block="mute musician number %musicianNumber"
    export function muteMusician(musicianNumber: number) {
        radio.setGroup(84)
        radio.sendValue("mm", musicianNumber)
    }
    /**
     * unmute a musician
     */
    //% block advanced=true
    //% blockId="MBORCH_unMuteMusician" block="unmute musician number %musicianNumber"
    export function unMuteMusician(musicianNumber: number) {
        radio.setGroup(84)
        radio.sendValue("mum", musicianNumber)
    }


    /**
 * solo a musician
 */
    //% block advanced=true
    //% blockId="MBORCH_soloMusician" block="solo musician number %musicianNumber"
    export function soloMusician(musicianNumber: number) {
        radio.setGroup(84)
        radio.sendValue("ms", musicianNumber)
    }

    /**
* mute all musicians
*/
    //% block advanced=true
    //% blockId="MBORCH_muteAllMusicians" block="mute all musicians"
    export function muteAllMusicians() {
        radio.setGroup(84)
        radio.sendValue("mm", 1337)
    }

    /**
* unmute all musicians
*/
    //% block advanced=true
    //% blockId="MBORCH_unMuteAllMusicians" block="unmute all musicians "
    export function unMuteAllMusicians() {
        radio.setGroup(84)
        radio.sendValue("ms", 1337) //it actually solos all musicians
    }

    /**
         * Retrigger the master clock back to 0
         */
    //% block advanced=true
    //% blockId="MBORCH_resetMasterSync" "block=reset the master clock back to zero"
    export function resetMasterClockSync() {
        lastClockTickTime = 0
        masterClockStep = -1
        runMasterClock()
    }


    /**
     * Setup this microbit as the master clock
     */
    //% blockId="MBORCH_setupAsMAsterClock" block="Make master clock with| steps %numberOfSteps BPM %bpm subdivision of %subDivision Metronome beeps %MetronomeBeeps"
    export function setUpAsMasterClock(NumberOfSteps: numberofSteps, bpm: number, subDivision: subDiv, MetronomeBeeps: beepsOnOff) {
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
                //control.waitMicros(2000)
                basic.pause(1)
            }
        })
        nextClockTickTime = input.runningTime() + stepLengthms
    }
} 
