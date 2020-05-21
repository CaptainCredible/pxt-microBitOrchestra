/**
 * Custom blocks
 */
//% weight=100 color=#0fbc11 icon=""
//%blockId="OrchestraMusician" block="Orchestra Musicians"
namespace OrchestraMusician {

    /**
     * Sets the system for making sure 2 micro:bits don't send at the same time
     */

    //%blockId="MBORCH_timeSlotType" block="set timeslot mode to $Type" weight = 0 
    //%advanced=true
    export function sertTimeSlotMode(Type: timeSlotModes) {
        timeSlotMode = Type
    }

    function showScore() {

        if (!scoreIsLocked) {
            myScore += 2 //compensate for having pressed 2 buttons to show score
        }


        scoreIsLocked = true
        basic.showNumber(myScore)
    }



    function startMusicianGameTimers() {
        control.inBackground(function () {
            while (true) {

                if (receivedPrematureA) {
                    if (input.runningTime() - prematureAtimer > slack) {
                        receivedPrematureA = false
                        if (!scoreIsLocked) {
                            myScore--
                        }
                    }
                }

                if (ready4A) {
                    if (input.runningTime() - ready4Atimer > slack) {
                        ready4A = false
                        if (!scoreIsLocked) {
                            myScore--
                        }

                    }
                }

                if (receivedPrematureB) {
                    if (input.runningTime() - prematureBtimer > slack) {
                        receivedPrematureB = false
                        if (!scoreIsLocked) {
                            myScore--
                        }
                    }
                }

                if (ready4B) {
                    if (input.runningTime() - ready4Btimer > slack) {
                        ready4B = false
                        if (!scoreIsLocked) {
                            myScore--
                        }
                    }
                }

                if (receivedPrematureRist) {
                    if (input.runningTime() - prematureRistTimer > slack) {
                        receivedPrematureRist = false
                    }
                }

                if (ready4Rist) {
                    if (input.runningTime() - ready4RistTimer > slack) {
                        ready4Rist = false
                    }
                }
                /*
                                if (ledIsOn) {
                                    if (input.runningTime() - ledTimer > slack) {
                                        basic.clearScreen()
                                        ledIsOn = false
                                    }
                                }
                                */
                basic.pause(10)
            }
        })
    }
    /**
         * Controll the u:bit hero game
         */

    //%blockId="MBORCH_HeroMaster" block="control microBitHero $command" weight = 0 
    //%advanced=true
    export function gameMaster(command: string) {
        radio.setGroup(84)
        radio.sendString(command)
    }

    let ABOnTime = 0
    let showScoreTimeDelay = 1000
    //let MreceivedPrematureA = false
    //let MreceivedPrematureB = false
    //let MmyScore = 0
    //let Mready4A = false
    //let Mready4B = false

    function MadjustScore(by: number) {
        if (!scoreIsLocked) {
            myScore += by
        }
    }

    /**
     * Starts the uBitOrchestraHero game, cannot be used together with setup as musician", "make a sequencer" or "wait for step"
     */
    //%blockId="MBORCH_Hero" block="play micro:bit orchestra hero $Type" weight = 0 
    export function microbitOrchestraHero() {
        gameActivated = true
        radio.setGroup(84)
        startMusicianGameTimers()
        radio.onReceivedValue(function (name: string, value: number) {
            if (name == "A") {
                scoreIsLocked = false
                if (receivedPrematureA) {
                    receivedPrematureA = false
                    MadjustScore(2)
                } else {
                    ready4A = true
                    ready4Atimer = input.runningTime()
                }
            } else if (name == "B") {
                scoreIsLocked = false
                if (receivedPrematureB) {
                    receivedPrematureB = false
                    MadjustScore(2)
                } else {
                    ready4B = true
                    ready4Btimer = input.runningTime()
                }
            } else if (name == "RESET") {
                myScore = 0
                scoreIsLocked = false
                music.playTone(800, 500)
                //control.reset()
            }
        })

        control.inBackground(function () {
            while (true) {
                if (input.buttonIsPressed(Button.AB)) {
                    if (!ABWasPressed) {
                        ABWasPressed = true
                        ABOnTime = input.runningTime()
                    } else {
                        if (input.runningTime() - ABOnTime > showScoreTimeDelay) {
                            showScore()
                        }
                    }
                } else {
                    ABWasPressed = false
                }
                basic.pause(20)
            }
        })


    }

    function handleMusicianGameAPressed() {
        if (ready4A) {
            ready4A = false
            MadjustScore(2)
        } else {
            receivedPrematureA = true
            prematureAtimer = input.runningTime()
        }
    }
    function handleMusicianGameBPressed() {
        if (ready4B) {
            ready4B = false
            MadjustScore(2)
        } else {
            receivedPrematureB = true
            prematureBtimer = input.runningTime()
        }
    }
    function handleMusicianGameRistet() {

    }

    /**
         * Registers code to run when button A+B is held in for x milliseconds
         */
    //
    //%block="when A+B is held in for $holdDuration milliseconds" weight=2
    //%color=#D400D4 weight=70
    //%holdDuration.defl=1000
    export function onButtonABHeldFor(holdDuration: number, thing: Action) {
        let funcABwasPressed = false
        let funcABtimer = 0
        let ABdone = false
        control.inBackground(function () {
            while (true) {
                if (input.buttonIsPressed(Button.AB)) {
                    if (!funcABwasPressed) {
                        funcABwasPressed = true
                        funcABtimer = input.runningTime()
                    } else {
                        if ((input.runningTime() - funcABtimer > holdDuration) && !ABdone) {
                            control.raiseEvent(1999, 10)
                            ABdone = true
                        }
                    }
                } else {
                    ABdone = false
                    funcABwasPressed = false
                }
                basic.pause(buttonScanSpeed)
            }
        })
        control.onEvent(1999, 10, thing);
    }
//
    /**
         * Registers code to run when input 0 is pulled over 500
         */
    //
    //%block="when p0 and 3V is touched - threshhold $threshHold" weight=90
    //%color=#D400D4 weight=10
    //%threshHold.defl=500
    export function onP0Touched(threshHold: number, thing: Action) {
        control.inBackground(function () {
            let p0wasOn = false
            pins.setPull(DigitalPin.P0, PinPullMode.PullDown)
            while (true) {
                let pinVal = pins.analogReadPin(AnalogPin.P0)
                if ((pinVal > (1023 - threshHold)) && !p0wasOn) {
                    if (gameActivated) {
                        handleMusicianGameAPressed()
                    }
                    control.raiseEvent(1990, 10)
                    p0wasOn = true
                } else if ((pinVal < (1023 - threshHold)) && p0wasOn) {
                    p0wasOn = false
                    control.raiseEvent(1991, 10)
                }
                basic.pause(buttonScanSpeed)
            }
        })
        control.onEvent(1990, 10, thing);
    }

    /**
         * Registers code to run when input 1 is pulled over 500
         */
    //
    //%block="when p1 and 3V is touched - threshhold $threshHold" weight=90
    //%color=#D400D4 weight=9
    //%threshHold.defl=500
    export function onP1Touched(threshHold: number, thing: Action) {
        control.inBackground(function () {
            let p1wasOn = false
            pins.setPull(DigitalPin.P1, PinPullMode.PullDown)
            while (true) {
                let pinVal = pins.analogReadPin(AnalogPin.P1)
                if ((pinVal > (1023 - threshHold)) && !p1wasOn) {
                    control.raiseEvent(1990, 20)
                    p1wasOn = true
                } else if ((pinVal < (1023 - threshHold)) && p1wasOn) {
                    p1wasOn = false
                    control.raiseEvent(1991, 20)
                }
                basic.pause(buttonScanSpeed)
            }
        })
        control.onEvent(1990, 20, thing);
    }

    /**
         * Registers code to run when input 2 is pulled over 500
         */
    //
    //%block="when p2 and 3V is touched - threshhold $threshHold" weight=8
    //%color=#D400D4 weight=8
    //%threshHold.defl=500
    export function onP2Touched(threshHold: number, thing: Action) {
        control.inBackground(function () {
            let p2wasOn = false
            pins.setPull(DigitalPin.P2, PinPullMode.PullDown)
            while (true) {
                let pinVal = pins.analogReadPin(AnalogPin.P2)
                if ((pinVal > (1023 - threshHold)) && !p2wasOn) {
                    if (gameActivated) {
                        handleMusicianGameBPressed()
                    }
                    control.raiseEvent(1990, 30)
                    p2wasOn = true
                } else if ((pinVal < (1023 - threshHold)) && p2wasOn) {
                    p2wasOn = false
                    control.raiseEvent(1991, 30)
                }
                basic.pause(buttonScanSpeed)
            }
        })
        control.onEvent(1990, 30, thing);
    }

    /**
         * Registers code to run when input 2 is released
         */
    //
    //%block="when p2 and 3V is released" weight=5
    //%color=#D400D4 weight=5

    export function onP2Released(thing: Action) {
        control.onEvent(1991, 30, thing);
    }

    /**
     * Registers code to run when input 1 is released
     */
    //
    //%block="when p1 and 3V is released" weight=6
    //%color=#D400D4 weight=5

    export function onP1Released(thing: Action) {
        control.onEvent(1991, 20, thing);
    }

    /**
     * Registers code to run when input 0 is released
     */
    //
    //%block="when p0 and 3V is released" weight=7
    //%color=#D400D4 weight=5

    export function onP0Released(thing: Action) {
        control.onEvent(1991, 10, thing);
    }

    /**
     * Registers code to run when button A is pushed
     */
    //
    //%block="as soon as button A is pushed" weight=80
    //%color=#D400D4 weight=70
    export function onButtonAPressed(thing: Action) {
        control.inBackground(function () {
            while (true) {
                if (input.buttonIsPressed(Button.A) && !aWasPressed) {
                    if (gameActivated) {
                        handleMusicianGameAPressed()
                    }
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
                    if (gameActivated) {
                        handleMusicianGameBPressed()
                    }
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
         * Registers code to run when button shake is shook
         */

    //%block="as soon as shaken" 
    //%color=#D400D4 weight=65
    export function onShook(thing: () => void) {
        control.inBackground(function () {
            while (true) {
                shook = shake
                shake = input.acceleration(Dimension.Y)
                if ((shook - shake > shakeThresh) && (input.runningTime() - shakeTimer > shakeDebounce)) {
                    shakeTimer = input.runningTime()
                    control.raiseEvent(1985, 10)
                }
                basic.pause(10)
            }
        })
        control.onEvent(1985, 10, thing);
    }


    /**
     * inserts a pause to wait for tick
     */

    //% blockId="MBORCH_waitForStep" block="wait for step number %step" 
    //% weight=50
    export function waitFor(step: number) {
        if (runningInSimulator) {
            extClock = 0 /////HERE
        }
        extClock = 1
        waiting = true
        while (waiting) {
            basic.pause(1)
            if (currentStep == step)
                waiting = false
            waitForTimeSlot()
        }
    }








    /**
     * Setup the routing of the 4 sequencer tracks
     */
    //% advanced=true
    //% blockId="MBORCH_setupTrackRouting" block="track %channels|sends name %Name| and number %note"
    //%advanced = true
    //% weight=600
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
    //% weight=500
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

    let isCleared = false

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
        if (input.buttonIsPressed(Button.B)) {
            if (!bWasPressed) {
                bWasPressed = true
                Btimer = input.runningTime() //HERE I AM
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

                    if (redirectLocalHW) {
                        control.raiseEvent(80085, channelOutNotes[channelSelect] + 1)
                    } else if (channelIsSetup[channelSelect] && microBitID != 9876) {   //check that we have set up this channel and that we have set a microbit ID
                        send(channelOutNotes[channelSelect], channelOutNames[channelSelect])
                    }
                }

                clearTriggerBuffer()
                updatePage()
            } else { //if B already was pressed in
                if ((input.runningTime() > Btimer + 1000) && !isCleared) {
                    clearChannel(channelSelect)
                    clearAnimation(channelSelect)
                    isCleared = true
                    updatePage()
                }
            }
        } else if (!(input.buttonIsPressed(Button.B)) && bWasPressed) {
            bWasPressed = false
            isCleared = false
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

    function clearAnimation(chann: number) {
        for (let i = 4; i >= 0; i--) {
            led.plot(i, chann)
            basic.pause(10)
        }
        for (let i = 4; i >= 0; i--) {
            led.unplot(i, chann)
            basic.pause(10)
        }
    }

    //%blockID="redirectToLocal" block="handle sequencer playback locally"
    export function redirectSeqToLocal() {
        redirectLocalHW = true
        timeSlotMode = 1337
    }





    function sendTriggersOut() {  //read the buffer and send any notes that need to be sent
        if (polySend) {
            let scanLength = 4
            if (replaceLastPolyWithThumper) {
                scanLength = 3
            }
            for (let m = 0; m < scanLength; m++) {
                if (triggerBuffer[m]) {
                    let noteToPoly = 0b0000000000000001 << channelOutNotes[m] // find corresponding bit
                    polySendBuffer = polySendBuffer | noteToPoly //set correstponding bit
                }
            }
            if (polySendBuffer > 0) {
                waitForTimeSlot()
                send(polySendBuffer, polyInstrumentName + "P")         //sends the buffer polyPhonically
                //led.toggleAll()
            }
            polySendBuffer = 0  //clear the buffer
            if (replaceLastPolyWithThumper && triggerBuffer[3]) {
                basic.pause(numberOfMusicians)
                send(channelOutNotes[3], channelOutNames[3])
            }
        } else if (timeSlotMode == 0) {
            legacySendTriggersOut()
        } else if (timeSlotMode == 1) {
            waitForTimeSlot()
            for (let m = 0; m < 4; m++) {
                if (triggerBuffer[m]) {   //if we find a note to send
                    triggerChannel(m)     // send it
                    basic.pause(numberOfMusicians); //wait til all musicians have sent their first note before sending second note  
                }
            }
        }
        if (timeSlotMode == 1337) {
            localSendTriggersOut()
        }
    }

    function waitForTimeSlot() {
        let timeToWait = microBitID * radioSendWindow
        control.waitMicros(timeToWait) // wait as long as the slot mode will allow
    }

    function localSendTriggersOut() {
        for (let m = 0; m < 4; m++) {
            if (triggerBuffer[m]) {
                control.raiseEvent(80085, m + 1)
                //basic.showNumber(m+1)

            }
        }
    }

    function legacySendTriggersOut() {
        for (let m = 0; m <= 4 - 1; m++) {
            if (triggerBuffer[m]) {
                waitForTimeSlot()
                triggerChannel(m)
            }
        }
    }

    function triggerChannel(channelToTrigger: number) {
        if (channelIsSetup[channelToTrigger]) {
            send(channelOutNotes[channelToTrigger], channelOutNames[channelToTrigger])
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
    //% blockId="MBORCH_makeAnAdvancedSequencer" block="make a really advanced sequencer:|number of steps %NumberOfSteps clock %Clock tempo %Tempo metronome clicks %Metronome make sounds for the notes sent %blipsAndBloops" 
    //% weight=800
    //% Tempo.min=40 Tempo.max=400
    //% Tempo.defl=120
    export function makeAnAdvancedSequencer(NumberOfSteps: numberofSteps, Clock: internalExternal, Tempo: number = 120, Metronome: metronomeNoYes, blipsAndBloops: allowBlipsNoYes): void {
        if (microBitID == 9876) {
            basic.showString("ERROR, SET ID")
        }
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
    }

    function clearChannel(thisChannel: number) {
        for (let i = 0; i <= seqLength; i++) {
            if (thisChannel == 0) {
                seqA[i] = false
            } else if (thisChannel == 1) {
                seqB[i] = false
            } else if (thisChannel == 2) {
                seqC[i] = false
            } else if (thisChannel == 3) {
                seqD[i] = false
            }
        }
        updatePage()

    }


    /**
     * set number of musicians in orchestra
     * 
     */
    //%blockId="setNumberOfMusicians" block="set number of musicians to $thisMany" advanced=true thisMany.defl=16
    export function setNumberOfMusicians(thisMany: number) {
        numberOfMusicians = thisMany
    }

    /**
         * Setup a simple sequencer
         * @param With how many steps
         * @param stepsAndUse internal or external clock
         */
    //% blockId="MBORCH_makeASimplerSequencer" block="make a simple sequencer:|number of steps = $NumberOfSteps|the instrument I am controlling is called $masterName the first sound I want to control is $note1|the second sound I want to control is $note2|the third sound I want to control is $note3|the fourth sound I want to control is $note4"
    //% note2.defl=1 note3.defl=2 note4.defl=3
    export function makeASimpleSequencer(NumberOfSteps: numberofSteps, masterName: string, note1: number, note2: number, note3: number, note4: number): void {
        polySend = true  //make it send polyphonic ints        
        polyInstrumentName = masterName
        if (masterName == "Me") {
            redirectLocalHW = true
            timeSlotMode = 1337
        }
        let allowBleeps = 1
        if (redirectLocalHW) {
            allowBleeps = 0
        }
        makeAnAdvancedSequencer(NumberOfSteps, internalExternal.autorun_in_simulator, 40, metronomeNoYes.no_thanks, allowBleeps)
        setUpTrackRouting(channels.one, masterName, note1 % 16)
        setUpTrackRouting(channels.two, masterName, note2 % 16)
        setUpTrackRouting(channels.three, masterName, note3 % 16)
        setUpTrackRouting(channels.four, masterName, note4 % 16)
        control.inBackground(function () {
            while (true) {
                basic.pause(20)
                runSequencer()
            }
        })
    }

    /**
         * Setup a simple autonomous sequencer that will run without a master clock controlling it
         * @param With how many steps
         * @param stepsAndUse internal or external clock
         */
    //% blockId="MBORCH_makeASimpleAutonomousSequencer" block="make an autonomous simple  sequencer:|number of steps = $NumberOfSteps|the instrument I am controlling is called $masterName the first sound I want to control is $note1|the second sound I want to control is $note2|the third sound I want to control is $note3|the fourth sound I want to control is $note4|tempo = $tEmpo"
    //% note2.defl=1 note3.defl=2 note4.defl=3
    //% tEmpo.defl=60
    //% advanced = true
    export function makeASimpleAutonomousSequencer(NumberOfSteps: numberofSteps, masterName: string, note1: number, note2: number, note3: number, note4: number, tEmpo: number): void {
        polySend = true  //make it send polyphonic ints        
        polyInstrumentName = masterName

        makeAnAdvancedSequencer(NumberOfSteps, internalExternal.internal_clock, tEmpo, metronomeNoYes.no_thanks, allowBlipsNoYes.yes_please)
        setUpTrackRouting(channels.one, masterName, note1)
        setUpTrackRouting(channels.two, masterName, note2)
        setUpTrackRouting(channels.three, masterName, note3)
        setUpTrackRouting(channels.four, masterName, note4)
        control.inBackground(function () {
            while (true) {
                basic.pause(20)
                runSequencer()
            }
        })
    }

    /**
         * Setup a sequencer
         * @param With how many steps
         * @param stepsAndUse internal or external clock
         */
    //% blockId="MBORCH_makeASequencer" block="make a sequencer:|number of steps %NumberOfSteps|track 1 sends name %name1 and number %note1|track 2 sends name %name2 and number %note2|track 3 sends name %name3 and number %note3|track 4 sends name %name4 and number %note4" advanced=true weight=900
    export function makeASequencer(NumberOfSteps: numberofSteps, name1: string, note1: number, name2: string, note2: number, name3: string, note3: number, name4: string, note4: number): void {
        if (!redirectLocalHW) {
            timeSlotMode = timeSlotModes.stagger //only set this if we need to
        }

        radioSendWindow = 4000
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
    //% blockId="MBORCH_setUpAsMusician" block="join the orchestra as a musician with the ID number %withID" weight=100
    export function setUpAsMusician(withID: number): void {
        radio.setGroup(84) // tempo and clock ticks will be sent on radio group 84
        microBitID = withID
        isInstrument = false
        //radio.onDataPacketReceived(({ receivedString: msgID, receivedNumber: receivedData }) => {
        radio.onReceivedValue(function (msgID: string, receivedData: number) {
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
            } else if (msgID == "win") {//Set the radiosend window duration
                radioSendWindow = receivedData
            }
        })
        basic.showNumber(microBitID, 0)

    }

    /**
     * Send a command to the Microbit Orchestra
     */
    //%blockId="MBORCH_sendNote" block="ask the instrument $to to play sound number $note" weight=60
    export function send(note: number, to: string) {
        if (!musicianIsMuted) {
            //basic.pause(microBitID * timeSlotSpacing) //safer pause
            if (!runningInSimulator) {
                radio.setGroup(83) // change to the group where the Instruments are
                radio.sendValue(to, note)
                radio.setGroup(84) // change back to the group where tempo and clock ticks are
            }
        } else {
            basic.showIcon(IconNames.No, 0)
        }
    }




    ////////////////////////////////////////

    let pageOffset = 0
    function updatePage() {
        if (musicianIsMuted) {
            basic.showIcon(IconNames.No, 0)
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

