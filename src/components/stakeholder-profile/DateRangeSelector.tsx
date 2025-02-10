
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface DateRangeSelectorProps {
  startDate?: Date;
  endDate?: Date;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  handleReset: () => void;
}

export const DateRangeSelector = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  handleReset,
}: DateRangeSelectorProps) => {
  const formatDateForButton = (date: Date | undefined) => {
    if (!date) return "";
    return window.innerWidth < 640 ? format(date, "dd/MM/yy") : format(date, "PPP");
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[140px] justify-start text-sm">
              {startDate ? formatDateForButton(startDate) : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[140px] justify-start text-sm">
              {endDate ? formatDateForButton(endDate) : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button variant="secondary" onClick={handleReset} className="w-[100px]">
          Reset
        </Button>
      </div>
    </div>
  );
};
