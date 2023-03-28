import { Platform, StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Button } from 'react-native-paper'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'

export interface DatePickerProps {
  date: Date
  onChangeCallback: (date: Date) => void
}

const DatePicker = ({ date, onChangeCallback }: DatePickerProps) => {
  const [mode, setMode] = useState<'date' | 'time'>('date')
  const [open, setOpen] = useState(false)

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setOpen(false)
    if (selectedDate) {
      onChangeCallback(selectedDate)
    }
  }

  const showMode = (currentMode: 'date' | 'time') => {
    if (Platform.OS === 'android') {
      setOpen(false)
      // for iOS, add a button that closes the picker
    }
    setOpen(true)
    setMode(currentMode)
  }

  const showDatepicker = () => {
    showMode('date')
  }

  const showTimepicker = () => {
    showMode('time')
  }

  return (
    <View>
      {Platform.OS === 'ios' && (
        <View style={styles.container}>
          <DateTimePicker value={date} mode={'datetime' as any} onChange={onChange} />
        </View>
      )}
      {Platform.OS === 'android' && (
        <View style={styles.container}>
          <Button mode="contained-tonal" onPress={showDatepicker} style={styles.button}>
            {date.toDateString()}
          </Button>
          <Button mode="contained-tonal" onPress={showTimepicker} style={styles.button}>
            {date.getHours().toString().padStart(2, '0') +
              ':' +
              date.getMinutes().toString().padStart(2, '0')}
          </Button>
          {open && <DateTimePicker value={date} mode={mode} is24Hour={true} onChange={onChange} />}
        </View>
      )}
    </View>
  )
}

export default DatePicker

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flexDirection: 'row',
  },
  button: {
    marginHorizontal: 5,
  },
})
