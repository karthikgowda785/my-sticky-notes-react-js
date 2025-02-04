import { useEffect, useRef, useState } from "react";
import Trash from "../icons/Trash";
import { autoGrow, setNewOffset, setZIndex } from "../utils";
import { useNotesDataContext } from "../context/NotesDataContext";
import Loading from "../icons/Loading";

/* eslint-disable react/prop-types */
const NoteCard = ({ note }) => {
  const [positions, setPositions] = useState(JSON.parse(note?.position));
  const { notesData, setNotesData } = useNotesDataContext();
  const [isCardLoading, setIsCardLoading] = useState(false);

  const textAreaRef = useRef(null);
  const cardRef = useRef(null);
  const keyUpTimer = useRef(null);

  const colors = JSON.parse(note?.colors);
  const cardBody = JSON.parse(note?.body);

  let mouseStartPos = { x: 0, y: 0 };

  useEffect(() => {
    autoGrow(textAreaRef);
  }, []);

  const mouseDown = (e) => {
    setZIndex(cardRef.current);
    mouseStartPos.x = e.clientX;
    mouseStartPos.y = e.clientY;

    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  };

  const mouseMove = (e) => {
    // NOTE: getting amount of card moved
    let mouseMoveDir = {
      x: mouseStartPos?.x - e.clientX,
      y: mouseStartPos?.y - e.clientY,
    };

    mouseStartPos.x = e.clientX;
    mouseStartPos.y = e.clientY;

    const newPositions = setNewOffset(cardRef.current, mouseMoveDir);
    setPositions(newPositions);

    const updatedData = notesData?.map((item) =>
      String(item?.id) === String(cardRef.current?.id)
        ? { ...item, position: JSON.stringify(newPositions) }
        : item
    );
    setNotesData(updatedData);
  };

  const mouseUp = () => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  };

  const onDeleteNotes = (itemId) => {
    setIsCardLoading(true);
    setTimeout(() => {
      const updatedData = notesData?.filter((notes) => notes?.id !== itemId);
      setNotesData(updatedData);
      setIsCardLoading(false);
    }, 500);
  };

  const handleKeyUp = (noteId) => {
    setIsCardLoading(true);
    if (keyUpTimer.current) {
      clearTimeout(keyUpTimer.current);
    }

    keyUpTimer.current = setTimeout(() => {
      const updatedData = notesData?.map((item) =>
        item?.id === noteId
          ? { ...item, body: JSON.stringify(textAreaRef.current.value) }
          : item
      );
      setNotesData(updatedData);
      setIsCardLoading(false);
    }, 2000);
  };

  return (
    <div
      id={note?.id}
      ref={cardRef}
      className="card"
      style={{
        backgroundColor: colors?.colorBody,
        left: `${positions?.x}px`,
        top: `${positions?.y}px`,
      }}
    >
      <div
        onMouseDown={(e) => mouseDown(e, note?.id)}
        className="card-header"
        style={{ backgroundColor: colors?.colorHeader }}
      >
        <div onClick={() => onDeleteNotes(note?.id)}>
          <Trash />
        </div>

        {isCardLoading && <Loading />}
      </div>
      <div className="card-body">
        <textarea
          name={note?.id}
          onFocus={() => setZIndex(cardRef.current)}
          onInput={() => autoGrow(textAreaRef)}
          onKeyUp={() => handleKeyUp(note?.id)}
          ref={textAreaRef}
          style={{ color: colors?.colorText }}
          defaultValue={cardBody}
        ></textarea>
      </div>
    </div>
  );
};

export default NoteCard;
