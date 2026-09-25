// Salomé's. If a game breaks while it runs, this shows the puzzle in big words
// instead of a blank page. Claude never changes this file.
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface PuzzleScreenProps {
  children: ReactNode;
}

interface PuzzleScreenState {
  message: string;
}

// this wraps one game and catches anything that breaks inside it
export class PuzzleScreen extends Component<PuzzleScreenProps, PuzzleScreenState> {
  state: PuzzleScreenState = { message: "" };

  // React calls this when something inside breaks
  static getDerivedStateFromError(problem: unknown): PuzzleScreenState {
    return { message: problem instanceof Error ? problem.message : String(problem) };
  }

  componentDidCatch(problem: Error, info: ErrorInfo): void {
    console.warn("puzzle", problem, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.message !== "") {
      return (
        <pre className="puzzle">
          It's not broken, it's a puzzle:{"\n"}
          {this.state.message}
        </pre>
      );
    }
    return this.props.children;
  }
}
