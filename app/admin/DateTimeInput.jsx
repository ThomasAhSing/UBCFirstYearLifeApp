import React, { useState } from 'react';
import { View, Button, Platform, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTime } from 'luxon';

export default function DateTimeInput() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) setDate(selectedDate);
  };

  const luxonDate = DateTime.fromJSDate(date, { zone: 'America/Vancouver' });

  return (
    <View style={{ padding: 20 }}>
      <Button title="Pick Date & Time" onPress={() => setShow(true)} />

      {show && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
        />
      )}

      <Text style={{ color: 'white', marginTop: 10 }}>
        Selected ISO: {luxonDate.toISO()}
      </Text>
      <Text style={{ color: 'white', marginTop: 4 }}>
        Vancouver: {luxonDate.toFormat("yyyy-MM-dd")} at {luxonDate.toFormat("h a")}
      </Text>
    </View>
  );
}
