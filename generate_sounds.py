import wave
import struct
import math

def create_wav(filename, duration, freq):
    sample_rate = 44100.0
    num_samples = int(duration * sample_rate)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1) # mono
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(sample_rate)
        
        for i in range(num_samples):
            value = int(16383.0 * math.sin(2.0 * math.pi * freq * (i / sample_rate)))
            data = struct.pack('<h', value)
            wav_file.writeframesraw(data)

create_wav('audio/success.wav', 0.2, 880)
create_wav('audio/error.wav', 0.4, 220)
print("Sounds generated.")
