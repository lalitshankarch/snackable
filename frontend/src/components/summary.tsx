import { GoInfo, GoBook } from "react-icons/go";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
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
  if (status == Status.None) return <div />;

  const renderContent = (): ReactNode => {
    switch (status) {
      case Status.Loading:
        return (
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-24" />
            <div className="space-y-2">
              <Skeleton className="h-4" />
              <Skeleton className="h-8" />
            </div>
          </div>
        );
      case Status.Fetched:
        return <ReactMarkdown>{message}</ReactMarkdown>;
      case Status.Error:
        return (
          <div className="flex items-center gap-1 text-red-500">
            <GoInfo />
            <p>{message}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="flex-auto p-4">
      <CardHeader className="p-0">
        <div className="flex justify-between items-center">
          <CardTitle>Summary</CardTitle>
          <GoBook />
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-2">{renderContent()}</CardContent>
    </Card>
  );
};

export default SummaryCard;
