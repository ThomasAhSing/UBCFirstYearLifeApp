// external imports 
import { StyleSheet, Text } from "react-native";
import { useState } from "react";

// project imports
import ScreenWrapper from '../ScreenWrapper';
import DayMonthBar from '@/app/EventsComponents/DayMonthBar'
import { Calendar, LocaleConfig } from 'react-native-calendars';

export default function EventsScreen() {

    const [viewMode, setViewMode] = useState("Month")
    const [selected, setSelected] = useState('');
    return (
        <ScreenWrapper>
            <DayMonthBar viewMode={viewMode} setViewMode={setViewMode} />
            <Calendar
                onDayPress={day => {
                    setSelected(day.dateString);
                }}
                markedDates={{
                    [selected]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' }
                }}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({

});
