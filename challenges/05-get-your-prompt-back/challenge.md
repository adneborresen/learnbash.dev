---
id: get-your-prompt-back
title: "Get your prompt back"
module: find-your-way
concept: "Cancelling a waiting command"
introduces: ["Ctrl+C"]
reuses: ["cat"]
check: answer
answer_label: "Recovery code"
expected_answer: "6318"
---

## Story

You type `cat`, press Enter, and nothing seems to happen. There is no new prompt.
The command is waiting for text from your keyboard. Let's practise getting out.

## Goal

Run `cat` **without a filename**. Type `hello` and press Enter: cat repeats it.
Stop the command and get your prompt back. Then read `~/recovery.txt` and enter its recovery code in the answer box.
On a phone, use the **Ctrl-C** button below the terminal.

## Hint 1

While cat is waiting, what you type goes to cat, not to Bash. Look for a key combination that stops the current command.

## Hint 2

Press <kbd>Ctrl</kbd>+<kbd>C</kbd>: hold Ctrl and tap C, or tap the Ctrl-C button. Do not type the characters `^C`.
When the prompt returns, you can run commands again.

## Hint 3

If cat is still waiting, press Ctrl+C. Once you see the prompt, run `cat ~/recovery.txt`.
Enter the code it prints in the answer box. If you already recovered the prompt, skip the cancellation step.

## Explanation

With no filename, `cat` reads from **standard input**, here your keyboard. Enter sends the line you typed; cat prints it back. The terminal also displays your typing, so the text can appear twice.

**Ctrl+C** normally interrupts the command running in the foreground. Here it stops cat and Bash shows its prompt again. The terminal may display `^C`; that is a notation for the key combination, not a command to type.

This is useful when a command appears stuck or you started the wrong one. It is not an undo command, and some programs handle it differently.

**Ctrl+D** on an empty input line also finishes this cat session: it indicates the end of input. It does not mean “cancel” in general. Both ways out work here.
