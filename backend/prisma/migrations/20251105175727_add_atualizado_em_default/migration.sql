-- CreateTable
CREATE TABLE `Movimentacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `materialId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `tecnico` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191),
    `dataHora` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `quantidadeAnterior` INTEGER NOT NULL,
    `quantidadeAtual` INTEGER NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`materialId`) REFERENCES `Material` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
ALTER TABLE `Material` 
    ADD COLUMN `estoqueMinimo` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `categoria` VARCHAR(191),
    ADD COLUMN `ativo` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `atualizadoEm` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
