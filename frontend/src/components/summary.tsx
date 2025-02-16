import { GoInfo, GoBook } from "react-icons/go";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";

export enum Status {
  Loading,
  Error,
  Fetched,
  None,
}

interface SummaryCardProps {
  status: Status;
  message: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ message, status }) => {
  let node: ReactNode;

  switch (status) {
    case Status.Loading:
      node = (
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-24" />
          <div className="space-y-2">
            <Skeleton className="h-4" />
            <Skeleton className="h-8" />
          </div>
        </div>
      );
      break;
    case Status.Fetched:
      node = <p>{message}</p>;
      break;
    case Status.Error:
      node = (
        <div className="flex items-center gap-1">
          <GoInfo style={{ fill: "rgb(239 68 68)" }} />
          <p className="text-red-500">{message}</p>
        </div>
      );
      break;
  }

  let none = status === Status.None;

  return (
    <div>
      {!none && (
        <Card className="flex-auto p-4">
          <CardHeader className="p-0">
            <div className="flex justify-between items-center">
              <CardTitle>Summary</CardTitle>
              <GoBook />
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-2">{node}</CardContent>
        </Card>
      )}
    </div>
  );
};

// Default export for the component
export default SummaryCard;
