
import { Doc } from "../../types";
import styles from "./popover.module.css"
import { JSX, useState } from "react";

type Props = {
  children: JSX.Element
  doc: Doc
  onToggleLock: (doc: Doc) => Promise<void>
}

export const Popover = ({ children, doc, onToggleLock }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdate = async () => {
    setIsOpen(false);
    await onToggleLock(doc);
  }

  return (
    <div className={styles.container}>

      <div onClick={() => setIsOpen(!isOpen)}>
        {children}
      </div>

      {isOpen && (
        <div className={styles.popover}>
          <button className={styles.close} onClick={() => setIsOpen(false)}>
            X
          </button>

          <button type="button" className={styles.action} onClick={handleUpdate}>{doc.lockedBy ? "Unlock" : "Lock"}</button>

        </div>
      )}
    </div>
  );
}
