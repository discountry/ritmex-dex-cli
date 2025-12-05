import { useInput } from "ink";

interface KeyboardNavigationArgs<THeader extends { shortcut: string }> {
  headers: THeader[];
  selectedHeaderIndex: number;
  selectNext: () => void;
  selectPrevious: () => void;
  toggleSort: (index: number) => void;
  increment?: () => void;
  decrement?: () => void;
  pageUp?: () => void;
  pageDown?: () => void;
}

export const useKeyboardNavigation = <THeader extends { shortcut: string }>({
  headers,
  selectedHeaderIndex,
  selectNext,
  selectPrevious,
  toggleSort,
  increment,
  decrement,
  pageUp,
  pageDown,
}: KeyboardNavigationArgs<THeader>) => {
  useInput((input, key) => {
    if (key.upArrow && decrement) {
      decrement();
      return;
    }

    if (key.downArrow && increment) {
      increment();
      return;
    }

    if (key.pageUp && pageUp) {
      pageUp();
      return;
    }

    if (key.pageDown && pageDown) {
      pageDown();
      return;
    }

    if (key.leftArrow) {
      selectPrevious();
      return;
    }

    if (key.rightArrow) {
      selectNext();
      return;
    }

    if (key.return) {
      toggleSort(selectedHeaderIndex);
      return;
    }

    const shortcutIndex = headers.findIndex((header) => header.shortcut === input);
    if (shortcutIndex >= 0) {
      toggleSort(shortcutIndex);
    }
  });
};
