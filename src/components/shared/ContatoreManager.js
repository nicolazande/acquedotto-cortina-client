const ContatoreManager = ({ contatoreId, onDeselect, hideCreateButton = false }) => {
    const [contatore, setContatore] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchContatore = async () => {
            if (!contatoreId) return;
            try {
                const response = await contatoreApi.getContatore(contatoreId);
                setContatore(response.data);
            } catch (error) {
                alert('Errore durante il recupero del contatore');
                console.error(error);
            }
        };
        fetchContatore();
    }, [contatoreId]);

    const handleCreateContatore = async (newContatore) => {
        try {
            const response = await contatoreApi.createContatore(newContatore);
            alert('Nuovo contatore creato con successo');
            setIsCreating(false);
            setContatore(response.data);
        } catch (error) {
            alert('Errore durante la creazione del contatore');
            console.error(error);
        }
    };

    const handleSaveContatore = async (updatedContatore) => {
        try {
            await contatoreApi.updateContatore(contatoreId, updatedContatore);
            alert('Contatore aggiornato con successo');
            setIsEditing(false);
            setContatore(updatedContatore);
        } catch (error) {
            alert('Errore durante l\'aggiornamento del contatore');
            console.error(error);
        }
    };

    return (
        <div className="contatore-manager">
            <h2>Gestione Contatore</h2>

            {isCreating && (
                <ContatoreEditor
                    contatore={{}}
                    onSave={handleCreateContatore}
                    onCancel={() => setIsCreating(false)}
                />
            )}

            {isEditing && contatore && (
                <ContatoreEditor
                    contatore={contatore}
                    onSave={handleSaveContatore}
                    onCancel={() => setIsEditing(false)}
                />
            )}

            {!isCreating && !isEditing && (
                <>
                    <div className="table-container">
                        <table className="info-table">
                            <tbody>
                                <tr>
                                    <th>Seriale</th>
                                    <td>{contatore?.seriale || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Seriale Interno</th>
                                    <td>{contatore?.serialeInterno || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Ultima Lettura</th>
                                    <td>{contatore?.ultimaLettura ? new Date(contatore.ultimaLettura).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Attivo</th>
                                    <td>{contatore?.attivo ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Condominiale</th>
                                    <td>{contatore?.condominiale ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Sostituzione</th>
                                    <td>{contatore?.sostituzione ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Subentro</th>
                                    <td>{contatore?.subentro ? 'Sì' : 'No'}</td>
                                </tr>
                                <tr>
                                    <th>Data Installazione</th>
                                    <td>{contatore?.dataInstallazione ? new Date(contatore.dataInstallazione).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Data Scadenza</th>
                                    <td>{contatore?.dataScadenza ? new Date(contatore.dataScadenza).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Note</th>
                                    <td>{contatore?.note || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="btn-container">
                        {!hideCreateButton && (
                            <button onClick={() => setIsCreating(true)} className="btn btn-create">
                                Crea Nuovo Contatore
                            </button>
                        )}
                        {contatore && (
                            <button onClick={() => setIsEditing(true)} className="btn btn-edit">
                                Modifica
                            </button>
                        )}
                        <button onClick={onDeselect} className="btn btn-back">
                            Indietro
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContatoreManager;
