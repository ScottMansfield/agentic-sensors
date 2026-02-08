# Copyright 2025 Google LLC
# SPDX-License-Identifier: Apache-2.0

import threading

print("Waiting indefinitely...")

event = threading.Event()

try:
    # Block the thread indefinitely
    event.wait() 
except KeyboardInterrupt:
    print("\nProgram interrupted. Exiting.")

