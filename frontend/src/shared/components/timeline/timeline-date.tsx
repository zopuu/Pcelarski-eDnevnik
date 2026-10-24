import { Text, View } from 'react-native';

type TimelineDateProps =
  | { variant: 'instant'; value: string; showTime?: boolean }
  | { variant: 'range'; start: string; end?: string | null; showTime?: boolean };

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const dateOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};
const dateOnlyFormatter = new Intl.DateTimeFormat('sr-Latn-RS', {
  ...dateOptions,
  timeZone: 'UTC',
});
const dateTimeFormatter = new Intl.DateTimeFormat('sr-Latn-RS', dateOptions);
const timeFormatter = new Intl.DateTimeFormat('sr-Latn-RS', {
  hour: '2-digit',
  minute: '2-digit',
});

function parseTimelineValue(value: string) {
  const dateOnly = dateOnlyPattern.exec(value);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return {
      date: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))),
      isDateOnly: true,
    };
  }

  return { date: new Date(value), isDateOnly: false };
}

export function formatTimelineDate(value: string) {
  const { date, isDateOnly } = parseTimelineValue(value);
  if (Number.isNaN(date.getTime())) return value;

  return (isDateOnly ? dateOnlyFormatter : dateTimeFormatter).format(date);
}

function formatTimelineTime(value: string) {
  const { date, isDateOnly } = parseTimelineValue(value);
  if (isDateOnly || Number.isNaN(date.getTime())) return null;

  return timeFormatter.format(date);
}

function DateLabel({
  value,
  showTime,
  muted = false,
}: {
  value: string;
  showTime: boolean;
  muted?: boolean;
}) {
  const time = showTime ? formatTimelineTime(value) : null;
  const formattedDate = formatTimelineDate(value);
  const yearMatch = /\s(\d{4}\.)$/.exec(formattedDate);
  const dayAndMonth = yearMatch
    ? formattedDate.slice(0, yearMatch.index)
    : formattedDate;

  return (
    <View className="items-center">
      <Text
        numberOfLines={1}
        className={`text-center text-xs ${muted ? 'text-muted' : 'font-bold text-foreground'}`}
      >
        {dayAndMonth}
      </Text>
      {yearMatch && (
        <Text
          style={{ transform: [{ translateX: 2 }] }}
          className={`text-center text-xs ${muted ? 'text-muted' : 'font-bold text-foreground'}`}
        >
          {yearMatch[1]}
        </Text>
      )}
      {time && (
        <Text className="mt-1 text-center text-xs text-muted">{time}</Text>
      )}
    </View>
  );
}

export function TimelineDate(props: TimelineDateProps) {
  if (props.variant === 'instant') {
    return <DateLabel value={props.value} showTime={props.showTime ?? false} />;
  }

  return (
    <View className="items-center">
      {props.end ? (
        <DateLabel value={props.end} showTime={props.showTime ?? false} />
      ) : (
        <Text className="text-center text-xs font-semibold text-primary">U toku</Text>
      )}
      <View className="my-2 h-px w-4 bg-border" />
      <DateLabel value={props.start} showTime={props.showTime ?? false} muted />
    </View>
  );
}
