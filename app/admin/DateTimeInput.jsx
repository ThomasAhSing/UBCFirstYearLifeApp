import React, { useMemo, useState } from 'react';
import { Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DateTimeInput({ value, onChange }) {
  const initial = useMemo(() => value ?? new Date(), [value]);
  const [tempDate, setTempDate] = useState(initial);

  if (Platform.OS === 'ios') {
    return (
      <View>
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="compact"              
          onChange={(_, d) => {
            if (!d) return;
            const merged = new Date(d);
            merged.setHours(tempDate.getHours(), tempDate.getMinutes(), 0, 0);
            setTempDate(merged);
            onChange(merged);
          }}
        />
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="spinner"               
          onChange={(_, d) => {
            if (!d) return;
            const merged = new Date(tempDate);
            merged.setHours(d.getHours(), d.getMinutes(), 0, 0);
            setTempDate(merged);
            onChange(merged);
          }}
        />
      </View>
    );
  }

  const [stage, setStage] = useState('date');

  const handleAndroid = (event, selected) => {
    if (stage === 'date') {
      if (event.type === 'dismissed' || !selected) return;
      setTempDate(selected);
      setStage('time');
      return;
    }
    if (event.type === 'dismissed' || !selected) return;
    const merged = new Date(tempDate);
    merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setTempDate(merged);
    onChange(merged);
  };

  return (
    <DateTimePicker
      value={stage === 'date' ? (value ?? new Date()) : tempDate}
      mode={stage}
      display="default"
      onChange={handleAndroid}
    />
  );
}
