import { TimePicker } from "@shopify/discount-app-components";
import {
  BlockStack,
  Box,
  Card,
  DatePicker,
  Icon,
  InlineGrid,
  InlineStack,
  Popover,
  Range,
  Select,
  TextField,
} from "@shopify/polaris";
import { CalendarIcon } from "@shopify/polaris-icons";
import { useEffect, useRef, useState } from "react";

// This example is for guidance purposes. Copying it will come with caveats.

type DatePickerFieldProps = {
  label?: string;
  date?: string;
  onChange?: (datestr: string) => void;
};

export function DatePickerField(props: DatePickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [{ month, year }, setDate] = useState({
    month: selectedDate.getMonth(),
    year: selectedDate.getFullYear(),
  });
  const formattedValue = selectedDate.toISOString().slice(0, 10);
  //   const datePickerRef = useRef<HTMLElement>(null);

  function handleInputValueChange() {
    console.log("handleInputValueChange");
  }

  function handleOnClose() {
    setVisible(false);
  }

  function handleMonthChange(month: number, year: number) {
    console.log("On change month: ", month, year);

    setDate({ month, year });
  }

  function handleDateSelection(date: Range) {
    console.log("Date range change: ", date);
    var newDate = new Date(
      date.end.getTime() - date.end.getTimezoneOffset() * 60 * 1000,
    );

    setSelectedDate(newDate);
    setVisible(false);
  }

  useEffect(() => {
    if (selectedDate) {
      setDate({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
      });
    }
  }, [selectedDate]);

  return (
    <Box
      minWidth="276px"
      // padding={{ xs: "200" }}
    >
      <Popover
        active={visible}
        autofocusTarget="none"
        preferredAlignment="left"
        fullWidth
        preferInputActivator={false}
        preferredPosition="below"
        preventCloseOnChildOverlayClick
        onClose={handleOnClose}
        activator={
          <TextField
            role="combobox"
            label={props.label}
            prefix={<Icon source={CalendarIcon} />}
            value={formattedValue}
            onFocus={() => setVisible(true)}
            onChange={handleInputValueChange}
            autoComplete="off"
          />
        }
      >
        <Card
        //   ref={datePickerRef}
        >
          <DatePicker
            month={month}
            year={year}
            selected={selectedDate}
            onMonthChange={handleMonthChange}
            onChange={handleDateSelection}
          />
        </Card>
      </Popover>
    </Box>
  );
}

// // TimePickerField
// function dfdf(params:type) {
//     return <TimePicker label=""></TimePicker>
// }
