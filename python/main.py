import threading

print("Waiting indefinitely...")

event = threading.Event()

try:
    # Block the thread indefinitely
    event.wait() 
except KeyboardInterrupt:
    print("\nProgram interrupted. Exiting.")

