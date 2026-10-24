"""VieNeu-TTS v3 Turbo on CPU, models kept in plain directories.

onnxruntime >= 1.31 refuses ONNX graphs whose external .data file resolves to another
directory, which is what the Hugging Face cache's symlinked blobs look like, so both model
repos are downloaded with local_dir and the engine is pointed straight at them."""
import os
from pathlib import Path

MODELS = Path(os.environ.get("VIENEU_MODELS", Path(__file__).resolve().parent / "models"))
BACKBONE, CODEC = MODELS / "v3-turbo", MODELS / "codec"


def fetch() -> None:
    from huggingface_hub import snapshot_download
    snapshot_download("pnnbao-ump/VieNeu-TTS-v3-Turbo", local_dir=BACKBONE, allow_patterns=["onnx_update/*", "*.onnx", "*.json"])
    snapshot_download("OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX", local_dir=CODEC)


def load(threads: int = 0):
    fetch()
    import vieneu._v3_turbo_engine.onnx_runtime_lite as ol
    Base = ol.OnnxV3LiteEngine

    class Local(Base):
        def __init__(self, **kw):
            kw.update(onnx_dir=str(BACKBONE / "onnx_update"), codec_dir=str(CODEC))
            super().__init__(**kw)

    ol.OnnxV3LiteEngine = Local
    from vieneu import Vieneu
    return Vieneu(mode="v3turbo", backbone_repo=str(BACKBONE), threads=threads)
