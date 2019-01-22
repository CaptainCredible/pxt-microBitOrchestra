// Add your code here
/**
 * Custom blocks
 */
//% weight=100 color=#01bc11 icon=""
//%blockId="OrchestraInstrument" block="Orchestra Instruments"
namespace OrchestraInstrument {
    /**
     * Setup pin pulse duration
     * @param how many milliseconds to keep the pin on
     */
    //% blockId="MBORCH_pulseDuration" block="set the pin pulse duration to $duration"
    export function setPinPulseDuration(duration: number) {
        globalPinOnTime = duration
    }


    //GAME//


    function startGameTimers() {
        control.inBackground(function () {

            while (true) {

                if (receivedPrematureA) {

                    if (input.runningTime() - prematureAtimer > slack) {
                        receivedPrematureA = false
                        // led.plot(2, 2)
                        // ledTimer = input.runningTime()
                        // ledIsOn = true
                        myScore--
                    }
                }

                if (ready4A) {
                    if (input.runningTime() - ready4Atimer > slack) {
                        ready4A = false
                    }
                }

                if (receivedPrematureB) {
                    if (input.runningTime() - prematureBtimer > slack) {
                        receivedPrematureB = false
                        // led.plot(2, 2)
                        // ledTimer = input.runningTime()
                        // ledIsOn = true
                        myScore--
                    }
                }

                if (ready4B) {
                    if (input.runningTime() - ready4Btimer > slack) {
                        ready4B = false
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

                if (ledIsOn) {
                    if (input.runningTime() - ledTimer > slack) {
                        basic.clearScreen()
                        ledIsOn = false
                    }
                }
                basic.pause(10)
            }
        })
    }

    function adjustScore(by: number) {
        if (!scoreIsLocked) {
            myScore += by
        }

    }

    function handleAscoring() {
        if (ready4A) {
            adjustScore(2)

            ready4A = false
        } else if (!receivedPrematureA) {
            receivedPrematureA = true
            prematureAtimer = input.runningTime()
        } else {
            adjustScore(-1)
            prematureAtimer = input.runningTime()
        }
    }

    /// HANDLESCORING

    function handleBscoring() {
        if (ready4B) {
            adjustScore(2)
            ready4B = false
        } else if (!receivedPrematureB) {
            receivedPrematureB = true
            prematureBtimer = input.runningTime()
        } else {
            adjustScore(-1)
            prematureBtimer = input.runningTime()
        }
    }

    function handleRistScoring() {
        if (ready4Rist) {
            adjustScore(3)
            ready4Rist = false
        } else if (!receivedPrematureRist) {
            receivedPrematureRist = true
            prematureRistTimer = input.runningTime()
        } else {
            prematureBtimer = input.runningTime()
        }
    }


    function handleScore(nameReceived: string, valueReceived: number) {
        if (nameReceived == "A") {
            if (receivedPrematureA) {
                myScore += 2
                receivedPrematureA = false
            } else {
                ready4A = true
                ready4Atimer = input.runningTime()
            }
        } else if (nameReceived == "B") {
            if (receivedPrematureB) {
                myScore += 2
                receivedPrematureB = false
            } else {
                ready4B = true
                ready4Btimer = input.runningTime()
            }
        } else if (nameReceived == "RESET") {

        }

        if (nameReceived == InstrumentName) {
            if (valueReceived == 0) {
                handleAscoring()
            } else if (valueReceived == 2) {
                handleBscoring()
            } else if (valueReceived == 3) {
                handleRistScoring()
            } else if (valueReceived == 1337) { //reset score command
                myScore = 0
            }

        }
    }

    ///////

    /**
     * Setup your micro:bit as an Instrument
     * @param withNam a unique name that the Musicians can shout to get your Instruments attention
     */
    //% blockId="MBORCH_joinAsInstrument" block="make an instrument with the name $withName"
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
                basic.pause(2)
            }
        })
    }

    //%blockId="MBORCH_redirectNotesToPulsePins" block="use incoming notes 1-8 to pulse pins|one %one|two %two|three %three|four %four|five %five|six %six|seven %seven|eight %eight" advanced=true
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
            if (dataToHandle & (bitCheckMask << i)) {
                noteToHandle = i
                handleInstrumentOutputMode(noteToHandle)
                //serial.writeValue("handled", noteToHandle)
            }
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
                if (input.runningTime() - onTimer[i] > globalPinOnTime) {
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

    function handleThumperMutes(muteInt: number) {
        /*
        Bob         00000001
        Tim         00000010
        Ted         00000100
        Pat         00001000
        Cat         00010000 (also thumper)
        Dad         00100000
        Mum         01000000
        Zim         10000000
        thumpers   100000000
        */
        if ((muteInt & 0b00010000) || (muteInt & 0b100000000)) {
            if (!thumperIsMuted) {
                basic.showIcon(IconNames.No, 0)
            }
            thumperIsMuted = true
        } else {
            if (thumperIsMuted) {
                basic.clearScreen()
            }
            thumperIsMuted = false
        }
    }

    //% blockId="setupBunMode" block="slave this thumper to Bun group as number $bunNumber and use solenoid action $solAction"
    //% solAction.defl=bunSolactions.auto
    //% advanced=true
    export function slaveToBun(bunNumber: number, solAction: bunSolactions) {
        bunSlave = true
        myBunNumber = bunNumber
        myBunAction = solAction
        if (solAction == 4) {
            myBunAction = myBunNumber % 4
        }
    }


    function handleBun(num: number, Type: number) {
        if (num == myBunNumber) {
            if (Type == 0) {
                actuateThumper(myBunAction)
            } else {
                generateThumperTones(num)
            }

        }
    }

    let thumperType = 0
    function generateThumperTones(tone: number) {
        music.playTone(noteFreq[tone % 36], 20)
    }
    /**
     * Make a Thumper, a device that listens for one specific radio message and triggers one actuator on P0
     * @param Name
     * @param Number
     */
    //% blockId="MBORCH_Thumper" block="make a thumper $Type, with the name $Name"
    export function makeAThumper(Name: string, Type: thumperType): void {
        InstrumentName = Name
        thumperType = Type
        if (gameActivated) {
            startGameTimers()
        }
        radio.setGroup(83)
        radio.onDataPacketReceived(({ receivedString: receivedName, receivedNumber: value }) => {
            //if (gameActivated) {
            //    handleScore(receivedName, value)
            //} // No game on thumper, game moved to musician
            if (!thumperIsMuted) {
                if (receivedName == Name || receivedName == "Rab") {
                    actuateThumper(value)
                } else if (((receivedName == Name + "T") || (receivedName == "RabT")) && thumperType == 1) {
                    generateThumperTones(value)
                } else if ((receivedName == Name + "P") || (receivedName == "RabP")) {
                    let myBitMask = 1
                    for (let i = 0; i < 16; i++) {
                        if (value & (myBitMask << i)) {
                            actuateThumper(i)
                        }
                    }
                } else if (((receivedName == Name + "TP") || (receivedName == "RabTP")) && thumperType == 1) {
                    let myBitMask = 1
                    for (let i = 0; i < 16; i++) {
                        if (value & (myBitMask << i)) {
                            generateThumperTones(i)
                        }
                    }
                } else if (bunSlave) {
                    if (receivedName == "Bun") {
                        handleBun(value, 0)
                    } else if (receivedName == "BunT") {
                        handleBun(value, 1)
                    } else if (receivedName == "BunP") {
                        let myBitMask = 1
                        for (let i = 0; i < 16; i++) {
                            if (value & (myBitMask << i)) {
                                handleBun(i, 0)
                            }
                        }
                    } else if (receivedName == "BunPT") {
                        let myBitMask = 1
                        for (let i = 0; i < 16; i++) {
                            if (value & (myBitMask << i)) {
                                handleBun(i, 1)
                            }
                        }
                    }
                }
            }


            if (receivedName == "m") {
                handleThumperMutes(value)
            }

            if (receivedName == "thump") {
                basic.clearScreen()
                if (value == 0) {
                    allowThumping = false
                } else {
                    allowThumping = true
   
                }
            }
        })
        basic.showString(Name, 40)
        basic.pause(200)
        basic.clearScreen()
        pulseThumperNose()
        //led.plot(2,4)
        if (thumperIsMuted) {
            basic.showIcon(IconNames.No, 1)
        }


        input.onButtonPressed(Button.AB, function () {
            displayingScore = true
            basic.showNumber(myScore)
            //basic.pause(500)
            displayingScore = false
        })
    }

    function actuateThumper(activityType: number) {
        if (thumperType == 0) {
            thumpPin = DigitalPin.P0
        } else {
            thumpPin = DigitalPin.P1
        }
        if (!allowThumping) {
            thumpPin = DigitalPin.P0
        }

        switch (activityType) {
            case 0: {
                basic.showLeds(`
    . . . . .
    . . . . .
    . . . . .
    # # # # #
    # # # # #
    `, 0)
                pins.digitalWritePin(thumpPin, 1)
                basic.pause(5)
                pins.digitalWritePin(thumpPin, 0)
                basic.pause(10)
                break;
            }

            case 1: {
                basic.showLeds(`
    . # . # .
    . # . # .
    . # . # .
    . # . # .
    . # . # .
    `, 0)
                pins.digitalWritePin(thumpPin, 1)
                control.waitMicros(10000);
                pins.digitalWritePin(thumpPin, 0)
                control.waitMicros(10000);
                pins.digitalWritePin(thumpPin, 1)
                control.waitMicros(10000);
                pins.digitalWritePin(thumpPin, 0)
                control.waitMicros(10000);


                break;
            }

            case 2: {
                for (let i = 0; i < 7; i++) {
                    basic.showLeds(`
    # . # . #
    # . # . #
    # . # . #
    # . # . #
    # . # . #
    `, 0)
                    pins.digitalWritePin(thumpPin, 1)
                    control.waitMicros(5000)
                    led.toggleAll()
                    pins.digitalWritePin(thumpPin, 0)
                    control.waitMicros(6000)
                }
                break;
            }
            case 3: {

                for (let i = 0; i <= 6 - 1; i++) {
                    led.plotAll()
                    pins.digitalWritePin(thumpPin, 1)
                    basic.pause(5)
                    basic.clearScreen()
                    //control.waitMicros(4000)
                    pins.digitalWritePin(thumpPin, 0)
                    basic.pause((i + 1) * 5)
                    //control.waitMicros((i + 1) * 5000)
                }
                break;
            }

            default: {
                if (thumperType == 1) {
                    generateThumperTones(activityType);
                } else {
                    basic.showLeds(`
    . . . . .
    . . . . .
    . . . . .
    # # # # #
    # # # # #
    `, 0)
                    pins.digitalWritePin(thumpPin, 1)
                    basic.pause(5)
                    pins.digitalWritePin(thumpPin, 0)
                    basic.pause(10)

                }

                break;
            }
        }

        pins.digitalWritePin(thumpPin, 0)
        basic.clearScreen()
    }

    function pulseThumperNose() {
        control.inBackground(function () {

            while (true) {
                /*
                    if (!thumperIsMuted) {
                        led.plot(1, 2)
                        led.plot(2, 2)
                        led.plot(3, 2)
                        led.plot(2, 3)
                        basic.pause(50)
                        if (!thumperIsMuted) { //avoid turning middle led off if we are muted
                            led.unplot(1, 2)
                            led.unplot(2, 2)
                            led.unplot(3, 2)
                            led.unplot(2, 3)
                            basic.pause(1950)
                        }
    
                    } else {
                        basic.pause(100)
                    }
                    */
                if (!displayingScore) {
                    if (allowThumping) {
                        led.plot(2, 4)
                    } else {
                        led.plot(2, 3)
                    }
                }
                basic.pause(100)
            }
        })
    }


    /**
 * Make a Grouped Thumper, a device that listens for one specific radio message and triggers one actuator on P0
 * @param Name
 * @param Number
 */
    //% block advanced=true
    //% blockId="MBORCH_groupedThumper" block="make a grouped thumper with the number $Number in the group $GroupName" weight=100
    export function makeAGroupedThumper(GroupName: string, Number: number): void {
        radio.setGroup(83)
        radio.onDataPacketReceived(({ receivedString: receivedName, receivedNumber: value }) => {
            if (receivedName == "m") {
                handleThumperMutes(value)
            }

            if (!thumperIsMuted) {
                if (value == -1 && GroupName == receivedName) { // this meens catch all
                    actuateThumper(0)
                }
                if (receivedName == GroupName && value == Number) {
                    actuateThumper(0)
                } else if (receivedName == GroupName + "P") {
                    let polyPMatch = 1 << (Number)
                    if (polyPMatch & value) {
                        actuateThumper(0)
                    }
                }
            }
        })
        basic.showString(GroupName, 40)
        basic.showNumber(Number, 40)
        basic.pause(200)
        basic.clearScreen()
        pulseThumperNose()
    }

    //%block="play bass drum through speaker.| length = %duration"
    //%duration.defl=200
    //%advanced=true
    export function playBassDrumThroughSpeaker(duration: number) {
        let l = duration
        for (let i = 0; i <= l - 1; i++) {
            music.playTone(l * 2 - i * 2, 0)
        }
        music.playTone(440, 1)
    }

    //%block="play snare drum through speaker.| length = %duration"
    //%duration.defl=200
    //%advanced=true
    export function playSnareDrumThroughSpeaker(duration: number) {
        let m = duration
        for (let i0 = 0; i0 < m; i0++) {
            music.playTone(Math.randomRange(1000, 4000), 0)
        }
        music.playTone(440, 1)
    }

    /**
 * Registers code to run when button A is pushed
 */
    //
    //%block="when sequencer plays local sound $sound" weight=80
    //%color=#D400D4 weight=70 //%sound.min=1 sound.max=128 sound.defl=1
    export function onSequencerTrigger(sound: number, thing: Action) {
        control.onEvent(80085, sound, thing);
    }


}
