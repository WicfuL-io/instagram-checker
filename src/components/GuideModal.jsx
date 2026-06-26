function GuideModal({ open, onClose }) {
    if (!open) return null;

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
        >
            <div
                className="modal-box guide-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ================= HEADER ================= */}
                <div className="guide-header">

                    <div>
                        <h2>📦 Panduan Download ZIP Instagram</h2>

                        <p>
                            Ikuti langkah berikut untuk mendapatkan file ZIP
                            Instagram dengan format yang benar sebelum
                            dianalisis oleh aplikasi.
                        </p>
                    </div>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>

                {/* ================= BODY (SCROLL) ================= */}
                <div className="guide-body">

                    <div className="guide-grid">

                        {/* CARD 1 */}
                        <div className="guide-card">

                            <div className="guide-step">
                                📱
                            </div>

                            <h3>Buka Menu Instagram</h3>

                            <p>
                                Masuk ke aplikasi Instagram kemudian buka
                                halaman <b> ( Profil )</b>, tekan ikon
                                <b> ( ☰ ) </b>
                                di kanan atas lalu masuk ke
                                <b> ( Account Center )</b>.
                            </p>

                        </div>

                        {/* CARD 2 */}
                        <div className="guide-card">

                            <div className="guide-step">
                                ⚙️
                            </div>

                            <h3>Masuk ke Download Data</h3>

                            <p>
                                Pilih menu
                                <b> ( Your Information and Permissions )</b>,
                                kemudian tekan
                                <b> ( Export Your Information )</b>.
                            </p>

                            <p>
                                Tekan Tombol
                                <b> ( Create Export )</b>,
                                pilih acount instagram anda 
                                <b> ( Export To Device )</b>.
                            </p>

                        </div>

                        {/* CARD 3 */}
                        <div className="guide-card">

                            <div className="guide-step">
                                📂
                            </div>

                            <h3>Konfigurasi Export</h3>

                            <ul>

                                <li>✔ Uncheck Semua Dahulu</li>

                                <ul>
                                    <li>✔ Customize Information</li>
                                    <li> →<i> ✔ Uncheck Semua Dahulu</i></li>
                                    <li> → pilih:<b> followers_and_following</b></li>
                                </ul>

                                <li>✔ Date Range : All Time</li>

                                <li>✔ Format : JSON</li>

                                <li>✔ Media Quality : Bebas</li>

                                <li>✔ Tekan Start Export</li>
                            </ul>

                        </div>

                        {/* CARD 4 */}
                        <div className="guide-card">

                            <div className="guide-step">
                                📥
                            </div>

                            <h3>Download ZIP</h3>

                            <p>
                                Instagram membutuhkan waktu beberapa menit
                                hingga beberapa jam untuk membuat file ZIP.
                            </p>

                            <p>
                                Setelah tombol
                                <b> ( Download ) </b>
                                muncul, unduh file ZIP tersebut.
                            </p>

                            <p>
                                Jangan membuka ataupun mengekstrak file ZIP.
                            </p>

                        </div>

                    </div>

                    {/* ================= TIPS ================= */}

                    <div className="guide-tip">

                        <h3>💡 Tips Penting</h3>

                        <ul>

                            <li>
                                Upload file dalam bentuk
                                <b> ZIP</b>, jangan diekstrak.
                            </li>

                            <li>
                                Pastikan format export adalah
                                <b> JSON</b>, bukan HTML.
                            </li>

                            <li>
                                Pastikan di dalam file hanya ada file dengan nama
                                <b> ( followers_and_following ) </b>
                                agar tidak terjadi kesalahan, karena hanya file itu yang di butuhkan.
                            </li>

                            <li>
                                Jika proses export belum selesai,
                                tunggu hingga Instagram mengirimkan
                                notifikasi download biasanya berada pada email notifikasi yang anda pilih.
                            </li>

                        </ul>

                    </div>

                </div>

                {/* ================= FOOTER ================= */}

                <div className="guide-footer">

                    <button
                        onClick={onClose}
                    >
                        Saya Mengerti
                    </button>

                </div>

            </div>

        </div>
    );
}

export default GuideModal;