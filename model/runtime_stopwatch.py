import time

class Stopwatch:
    def __init__(self):
        self.start_time = None
        self.end_time = None
        self.elapsed_time = None

    def start(self):
        """Start the stopwatch"""
        self.start_time = time.time()
        self.elapsed_time = None
        print("Stopwatch started...")

    def stop(self):
        """Stop the stopwatch and calculate the elapsed time"""
        if self.start_time is None:
            print("Stopwatch has not been started yet.")
            return
        
        self.end_time = time.time()
        self.elapsed_time = self.end_time - self.start_time
        print(f"Stopwatch stopped. Elapsed time: {self.elapsed_time:.2f} seconds.")

    def reset(self):
        """Reset the stopwatch"""
        self.start_time = None
        self.end_time = None
        self.elapsed_time = None
        print("Stopwatch reset.")

# Example usage
# stopwatch = Stopwatch()
# stopwatch.start()
# time.sleep(2)  # Simulate a task
# stopwatch.stop()